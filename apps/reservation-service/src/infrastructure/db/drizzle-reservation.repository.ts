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
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
} from "@reservation/contracts";

import type {
  CreateReservationResult,
  ReservationRepository,
} from "../../application/ports/reservation.repository.js";

export class DrizzleReservationRepository implements ReservationRepository {
  async createFromRequestedEvent(
    event: ReservationRequestedEvent,
  ): Promise<CreateReservationResult> {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.code, event.payload.channel),
    });

    if (!channel) {
      throw new Error(`Channel not found: ${event.payload.channel}`);
    }

    const pendingStatus = await db.query.reservationStatuses.findFirst({
      where: eq(reservationStatuses.code, "PENDING"),
    });

    if (!pendingStatus) {
      throw new Error("Reservation status not found: PENDING");
    }

    const currency = await db.query.currencies.findFirst({
      where: eq(currencies.code, "EUR"),
    });

    if (!currency) {
      throw new Error("Currency not found: EUR");
    }

    return db.transaction(async (tx) => {
      const existing = await tx.query.reservations.findFirst({
        where: and(
          eq(reservations.channelId, channel.id),
          eq(reservations.idempotencyKey, event.payload.idempotencyKey),
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
          code: event.payload.reservationId,
          propertyId: Number(event.payload.propertyId),
          unitId: Number(event.payload.unitId),
          channelId: channel.id,
          currencyId: currency.id,
          reservationNumber,
          checkIn: event.payload.checkIn,
          checkOut: event.payload.checkOut,
          status: pendingStatus.id,
          idempotencyKey: event.payload.idempotencyKey,
          correlationId: event.correlationId,
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
        correlationId: event.correlationId,
        causationId: event.eventId,
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
          correlationId: event.correlationId,
          causationId: event.eventId,
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

  async markInventoryLocked(event: InventoryLockedEvent): Promise<void> {
    const [pendingStatus, confirmedStatus] = await Promise.all([
      db.query.reservationStatuses.findFirst({
        where: eq(reservationStatuses.code, "PENDING"),
      }),
      db.query.reservationStatuses.findFirst({
        where: eq(reservationStatuses.code, "CONFIRMED"),
      }),
    ]);

    if (!pendingStatus) {
      throw new Error("Reservation status not found: PENDING");
    }

    if (!confirmedStatus) {
      throw new Error("Reservation status not found: CONFIRMED");
    }

    const reservationId = Number(event.payload.reservationId);

    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });

    if (!reservation) {
      throw new Error(
        `Reservation not found for InventoryLocked event. reservationId=${event.payload.reservationId}`,
      );
    }

    if (reservation.status === confirmedStatus.id) {
      logger.info(
        "InventoryLocked ignored because reservation is already CONFIRMED",
        {
          reservationId,
          correlationId: event.correlationId,
        },
      );
      return;
    }

    if (reservation.status !== pendingStatus.id) {
      throw new Error(
        `Invalid reservation transition on InventoryLocked. reservationId=${reservationId}, currentStatus=${reservation.status}, expectedStatus=${pendingStatus.id}`,
      );
    }

    const [updated] = await db
      .update(reservations)
      .set({
        status: confirmedStatus.id,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, pendingStatus.id),
        ),
      )
      .returning({
        id: reservations.id,
      });

    if (!updated) {
      throw new Error(
        `Reservation confirmation failed due to concurrent state change. reservationId=${reservationId}`,
      );
    }

    logger.info("Reservation marked as CONFIRMED", {
      reservationId,
      correlationId: event.correlationId,
    });
  }

  async markInventoryRejected(event: InventoryRejectedEvent): Promise<void> {
    const [pendingStatus, confirmedStatus, rejectedStatus] = await Promise.all([
      db.query.reservationStatuses.findFirst({
        where: eq(reservationStatuses.code, "PENDING"),
      }),
      db.query.reservationStatuses.findFirst({
        where: eq(reservationStatuses.code, "CONFIRMED"),
      }),
      db.query.reservationStatuses.findFirst({
        where: eq(reservationStatuses.code, "REJECTED"),
      }),
    ]);

    if (!pendingStatus) {
      throw new Error("Reservation status not found: PENDING");
    }

    if (!confirmedStatus) {
      throw new Error("Reservation status not found: CONFIRMED");
    }

    if (!rejectedStatus) {
      throw new Error("Reservation status not found: REJECTED");
    }

    const reservationId = Number(event.payload.reservationId);

    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });

    if (!reservation) {
      throw new Error(
        `Reservation not found for InventoryRejected event. reservationId=${event.payload.reservationId}`,
      );
    }

    if (reservation.status === rejectedStatus.id) {
      logger.info(
        "InventoryRejected ignored because reservation is already REJECTED",
        {
          reservationId,
          correlationId: event.correlationId,
        },
      );
      return;
    }

    if (reservation.status === confirmedStatus.id) {
      throw new Error(
        `Invalid reservation transition on InventoryRejected. reservationId=${reservationId} is already CONFIRMED`,
      );
    }

    if (reservation.status !== pendingStatus.id) {
      throw new Error(
        `Invalid reservation transition on InventoryRejected. reservationId=${reservationId}, currentStatus=${reservation.status}, expectedStatus=${pendingStatus.id}`,
      );
    }

    const [updated] = await db
      .update(reservations)
      .set({
        status: rejectedStatus.id,
        rejectionReason: event.payload.reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, pendingStatus.id),
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
      correlationId: event.correlationId,
      reason: event.payload.reason,
    });
  }
}
