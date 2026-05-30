import {
  and,
  channels,
  currencies,
  db,
  eq,
  outboxEvents,
  reservationStatuses,
  reservations,
} from "@reservation/database";
import { logger } from "@reservation/logger";
import type {
  InventoryLockRequestedEvent,
} from "@reservation/contracts";

import type { RequestReservationCommand } from "../../application/commands/request-reservation.command.js";
import type { ConfirmReservationCommand } from "../../application/commands/confirm-reservation.command.js";
import type { RejectReservationCommand } from "../../application/commands/reject-reservation.command.js";
import { ReservationMapper } from "../../domain/mappers/reservation.mapper.js";

import type {
  CreateReservationResult,
  ReservationRepository,
} from "../../application/ports/reservation.repository.js";
import { ReservationStatus } from "../../domain/reservation-status.js";

export class DrizzleReservationRepository implements ReservationRepository {

  async createFromRequestCommand(
    command: RequestReservationCommand,
  ): Promise<CreateReservationResult> {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.code, command.channelCode),
    });

    if (!channel) {
      throw new Error(`Channel not found: ${command.channelCode}`);
    }

    const pendingStatus = await db.query.reservationStatuses.findFirst({
      where: eq(reservationStatuses.code, "PENDING"),
    });

    if (!pendingStatus) {
      throw new Error("Reservation status not found: PENDING");
    }

    const currency = await db.query.currencies.findFirst({
      where: eq(currencies.code, command.currencyCode),
    });

    if (!currency) {
      throw new Error(`Currency not found: ${command.currencyCode}`);
    }

    return db.transaction(async (tx) => {
      const existing = await tx.query.reservations.findFirst({
        where: and(
          eq(reservations.channelId, channel.id),
          eq(reservations.idempotencyKey, command.idempotencyKey),
        ),
      });

      if (existing) {
        const existingOutboxEvent = await tx.query.outboxEvents.findFirst({
          where: and(
            eq(outboxEvents.aggregateType, "reservation"),
            eq(outboxEvents.aggregateId, String(existing.id)),
            eq(outboxEvents.eventType, "InventoryLockRequested"),
          ),
        });

        return {
          reservation: {
            id: existing.id,
            code: existing.code,
            propertyId: existing.propertyId,
            unitId: existing.unitId,
            checkIn: existing.checkIn,
            checkOut: existing.checkOut,
          },
          pendingInventoryLockOutboxEventId:
            existingOutboxEvent &&
            existingOutboxEvent.status !== "PUBLISHED"
              ? existingOutboxEvent.id
              : null,
        };
      }

      const reservationNumber = `RES-${Date.now()}-${Math.floor(
        Math.random() * 10_000,
      )}`;

      const [created] = await tx
        .insert(reservations)
        .values({
          code: command.reservationCode,
          propertyId: Number(command.propertyId),
          unitId: Number(command.unitId),
          channelId: channel.id,
          currencyId: currency.id,
          reservationNumber,
          checkIn: command.checkIn,
          checkOut: command.checkOut,
          status: pendingStatus.id,
          idempotencyKey: command.idempotencyKey,
          correlationId: command.correlationId,
          totalAmount: "0.00",
        })
        .returning({
          id: reservations.id,
          code: reservations.code,
          propertyId: reservations.propertyId,
          unitId: reservations.unitId,
          checkIn: reservations.checkIn,
          checkOut: reservations.checkOut,
        });

      if (!created) {
        throw new Error("Reservation creation failed inside transaction");
      }

      const inventoryLockRequested: InventoryLockRequestedEvent = {
        eventId: crypto.randomUUID(),
        eventType: "InventoryLockRequested",
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        causationId: command.causationId,
        payload: {
          reservationId: String(created.id),
          propertyId: String(created.propertyId),
          unitId: String(created.unitId),
          checkIn: created.checkIn,
          checkOut: created.checkOut,
        },
      };

      const [createdOutboxEvent] = await tx
        .insert(outboxEvents)
        .values({
          aggregateType: "reservation",
          aggregateId: String(created.id),
          eventType: inventoryLockRequested.eventType,
          payload: inventoryLockRequested,
          status: "PENDING",
          correlationId: command.correlationId,
          causationId: command.causationId,
        })
        .returning({
          id: outboxEvents.id,
        });

      if (!createdOutboxEvent) {
        throw new Error("Outbox event creation failed inside transaction");
      }

      return {
        reservation: created,
        pendingInventoryLockOutboxEventId: createdOutboxEvent.id,
      };
    });
  }

  async confirmReservation(command: ConfirmReservationCommand): Promise<void> {
    const reservationId = Number(command.reservationId);

    const dbReservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });

    if (!dbReservation) {
      throw new Error(
        `Reservation not found for InventoryLocked event. reservationId=${command.reservationId}`,
      );
    }

    const currentStatusCode = await this.getStatusCode(dbReservation.status);

    if (currentStatusCode === ReservationStatus.InventoryLocked) {
      logger.info(
        "InventoryLocked ignored because reservation is already INVENTORY_LOCKED",
        {
          reservationId,
          correlationId: command.correlationId,
        },
      );
      return;
    }

    const domainReservation = ReservationMapper.toDomain({
      id: dbReservation.id,
      code: dbReservation.code,
      propertyId: dbReservation.propertyId,
      unitId: dbReservation.unitId,
      guestId: dbReservation.guestId,
      reservationNumber: dbReservation.reservationNumber,
      channelId: dbReservation.channelId,
      currencyId: dbReservation.currencyId,
      checkIn: dbReservation.checkIn,
      checkOut: dbReservation.checkOut,
      statusCode: currentStatusCode,
      totalAmount: String(dbReservation.totalAmount),
      rejectionReason: dbReservation.rejectionReason,
      idempotencyKey: dbReservation.idempotencyKey,
      correlationId: dbReservation.correlationId,
    });

    const updatedReservation = domainReservation.confirmInventoryLock();

    const inventoryLockedStatus = await this.getStatusByCode(
      ReservationStatus.InventoryLocked,
    );

    const [updated] = await db
      .update(reservations)
      .set({
        status: inventoryLockedStatus.id,
        rejectionReason: updatedReservation.rejectionReason ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, dbReservation.status),
        ),
      )
      .returning({
        id: reservations.id,
      });

    if (!updated) {
      throw new Error(
        `Reservation inventory lock confirmation failed due to concurrent state change. reservationId=${reservationId}`,
      );
    }

    logger.info("Reservation marked as INVENTORY_LOCKED", {
      reservationId,
      correlationId: command.correlationId,
    });
  }

  async rejectReservation(command: RejectReservationCommand): Promise<void> {
    const reservationId = Number(command.reservationId);

    const dbReservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });

    if (!dbReservation) {
      throw new Error(
        `Reservation not found for InventoryRejected event. reservationId=${command.reservationId}`,
      );
    }

    const currentStatusCode = await this.getStatusCode(dbReservation.status);

    if (currentStatusCode === ReservationStatus.Rejected) {
      logger.info(
        "InventoryRejected ignored because reservation is already REJECTED",
        {
          reservationId,
          correlationId: command.correlationId,
        },
      );
      return;
    }

    const domainReservation = ReservationMapper.toDomain({
      id: dbReservation.id,
      code: dbReservation.code,
      propertyId: dbReservation.propertyId,
      unitId: dbReservation.unitId,
      guestId: dbReservation.guestId,
      reservationNumber: dbReservation.reservationNumber,
      channelId: dbReservation.channelId,
      currencyId: dbReservation.currencyId,
      checkIn: dbReservation.checkIn,
      checkOut: dbReservation.checkOut,
      statusCode: currentStatusCode,
      totalAmount: String(dbReservation.totalAmount),
      rejectionReason: dbReservation.rejectionReason,
      idempotencyKey: dbReservation.idempotencyKey,
      correlationId: dbReservation.correlationId,
    });

    const rejectedReservation = domainReservation.reject(command.reason);

    const rejectedStatus = await this.getStatusByCode(
      ReservationStatus.Rejected,
    );

    const [updated] = await db
      .update(reservations)
      .set({
        status: rejectedStatus.id,
        rejectionReason: rejectedReservation.rejectionReason ?? command.reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, dbReservation.status),
        ),
      )
      .returning({
        id: reservations.id,
      });

    if (!updated) {
      throw new Error(
        `Reservation rejection failed due to concurrent state change. reservationId=${reservationId}`,
      );
    }

    logger.info("Reservation marked as REJECTED", {
      reservationId,
      correlationId: command.correlationId,
      reason: command.reason,
    });
  }


  private async getStatusByCode(code: ReservationStatus) {
    const status = await db.query.reservationStatuses.findFirst({
      where: eq(reservationStatuses.code, code),
    });

    if (!status) {
      throw new Error(`Reservation status not found: ${code}`);
    }

    return status;
  }

  private async getStatusCode(statusId: number): Promise<ReservationStatus> {
    const status = await db.query.reservationStatuses.findFirst({
      where: eq(reservationStatuses.id, statusId),
    });

    if (!status) {
      throw new Error(`Reservation status not found. id=${statusId}`);
    }

    return status.code as ReservationStatus;
  }
}
