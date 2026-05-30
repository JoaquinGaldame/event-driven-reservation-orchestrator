import {
  and,
  db,
  eq,
  sql,
  inventoryLocks,
  inventoryLockStatuses,
  inventoryLockTypes,
  outboxEvents,
} from "@reservation/database";
import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
} from "@reservation/contracts";


import type { LockInventoryCommand } from "../../application/commands/lock-inventory.command.js";
import type {
  InventoryLockRepository,
  LockInventoryResult,
} from "../../application/ports/inventory-lock.repository.js";
import { InventoryLock } from "../../domain/inventory-lock.entity.js";
import { InventoryLockStatus } from "../../domain/inventory-lock-status.js";

export class DrizzleInventoryLockRepository implements InventoryLockRepository {
  async lockInventory(command: LockInventoryCommand): Promise<LockInventoryResult> {
    const existingLock = await db.query.inventoryLocks.findFirst({
      where: eq(inventoryLocks.reservationId, command.reservationId),
    });

    if (existingLock) {
      const existingOutbox = await db.query.outboxEvents.findFirst({
        where: and(
          eq(outboxEvents.aggregateType, "inventory_lock"),
          eq(outboxEvents.aggregateId, String(command.reservationId)),
          eq(outboxEvents.eventType, "InventoryLocked"),
        ),
      });

      return {
        outcome: "LOCKED",
        inventoryLock: {
          id: existingLock.id,
          reservationId: existingLock.reservationId,
          propertyId: existingLock.propertyId,
          unitId: existingLock.unitId,
          lockTypeCode: "RESERVATION",
          status: "ACTIVE",
          checkIn: existingLock.checkIn.toISOString(),
          checkOut: existingLock.checkOut.toISOString(),
        },
        rejectionReason: null,
        pendingResultOutboxEventId:
          existingOutbox && existingOutbox.status !== "PUBLISHED"
            ? existingOutbox.id
            : null,
      };
    }

    const existingRejectedOutbox = await db.query.outboxEvents.findFirst({
      where: and(
        eq(outboxEvents.aggregateType, "inventory_lock"),
        eq(outboxEvents.aggregateId, String(command.reservationId)),
        eq(outboxEvents.eventType, "InventoryRejected"),
      ),
    });

    if (existingRejectedOutbox) {
      return {
        outcome: "REJECTED",
        inventoryLock: null,
        rejectionReason: "UNIT_NOT_AVAILABLE",
        pendingResultOutboxEventId:
          existingRejectedOutbox.status !== "PUBLISHED"
            ? existingRejectedOutbox.id
            : null,
      };
    }

    const activeStatus = await db.query.inventoryLockStatuses.findFirst({
      where: eq(inventoryLockStatuses.code, InventoryLockStatus.Active),
    });

    if (!activeStatus) {
      throw new Error("Inventory lock status not found: ACTIVE");
    }

    const reservationLockType = await db.query.inventoryLockTypes.findFirst({
      where: eq(inventoryLockTypes.code, "RESERVATION"),
    });

    if (!reservationLockType) {
      throw new Error("Inventory lock type not found: RESERVATION");
    }

    const checkInDate = new Date(command.checkIn);
    const checkOutDate = new Date(command.checkOut);

    const overlap = await db.query.inventoryLocks.findFirst({
      where: sql`
        ${inventoryLocks.unitId} = ${command.unitId}
        and ${inventoryLocks.statusId} = ${activeStatus.id}
        and ${inventoryLocks.checkIn} < ${checkOutDate}
        and ${inventoryLocks.checkOut} > ${checkInDate}
      `,
    });

    if (overlap) {
      return db.transaction(async (tx) => {
        const rejectedEvent: InventoryRejectedEvent = {
          eventId: crypto.randomUUID(),
          eventType: "InventoryRejected",
          occurredAt: new Date().toISOString(),
          correlationId: command.correlationId,
          
          causationId: command.causationId,
          payload: {
            reservationId: String(command.reservationId),
            propertyId: String(command.propertyId),
            unitId: String(command.unitId),
            checkIn: command.checkIn,
            checkOut: command.checkOut,
            reason: "UNIT_NOT_AVAILABLE",
          },
        };

        const [createdOutbox] = await tx
          .insert(outboxEvents)
          .values({
            aggregateType: "inventory_lock",
            aggregateId: String(command.reservationId),
            eventType: rejectedEvent.eventType,
            payload: rejectedEvent,
            status: "PENDING",
            correlationId: command.correlationId,
            causationId: command.causationId,
          })
          .returning({
            id: outboxEvents.id,
          });

        if (!createdOutbox) {
          throw new Error("InventoryRejected outbox creation failed");
        }

        return {
          outcome: "REJECTED" as const,
          inventoryLock: null,
          rejectionReason: "UNIT_NOT_AVAILABLE" as const,
          pendingResultOutboxEventId: createdOutbox.id,
        };
      });
    }

    const domainLock = InventoryLock.request({
      reservationId: command.reservationId,
      propertyId: command.propertyId,
      unitId: command.unitId,
      lockTypeCode: "RESERVATION",
      checkIn: command.checkIn,
      checkOut: command.checkOut,
      expiresAt: null,
      correlationId: command.correlationId,
    });

    return db.transaction(async (tx) => {
      const [createdLock] = await tx
        .insert(inventoryLocks)
        .values({
          reservationId: domainLock.reservationId,
          propertyId: domainLock.propertyId,
          unitId: domainLock.unitId,
          lockTypeId: reservationLockType.id,
          statusId: activeStatus.id,
          checkIn: new Date(domainLock.checkIn),
          checkOut: new Date(domainLock.checkOut),
          expiresAt: null,
          correlationId: domainLock.correlationId,
        })
        .returning({
          id: inventoryLocks.id,
          reservationId: inventoryLocks.reservationId,
          propertyId: inventoryLocks.propertyId,
          unitId: inventoryLocks.unitId,
          checkIn: inventoryLocks.checkIn,
          checkOut: inventoryLocks.checkOut,
        });

      if (!createdLock) {
        throw new Error("Inventory lock creation failed");
      }

      const lockedEvent: InventoryLockedEvent = {
        eventId: crypto.randomUUID(),
        eventType: "InventoryLocked",
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        causationId: command.causationId,
        payload: {
          reservationId: String(command.reservationId),
          propertyId: String(command.propertyId),
          unitId: String(command.unitId),
          checkIn: command.checkIn,
          checkOut: command.checkOut,
        },
      };

      const [createdOutbox] = await tx
        .insert(outboxEvents)
        .values({
          aggregateType: "inventory_lock",
          aggregateId: String(command.reservationId),
          eventType: lockedEvent.eventType,
          payload: lockedEvent,
          status: "PENDING",
          correlationId: command.correlationId,
          causationId: command.causationId,
        })
        .returning({
          id: outboxEvents.id,
        });

      if (!createdOutbox) {
        throw new Error("InventoryLocked outbox creation failed");
      }

      return {
        outcome: "LOCKED" as const,
        inventoryLock: {
          id: createdLock.id,
          reservationId: createdLock.reservationId,
          propertyId: createdLock.propertyId,
          unitId: createdLock.unitId,
          lockTypeCode: "RESERVATION",
          status: "ACTIVE",
          checkIn: createdLock.checkIn.toISOString(),
          checkOut: createdLock.checkOut.toISOString(),
        },
        rejectionReason: null,
        pendingResultOutboxEventId: createdOutbox.id,
      };
    });
  }
}