 import {
    and,
    channels,
    currencies,
    db,
    eq,
    sql,
    outboxEvents,
    units,
    unitDailyRates,
    reservationStatuses,
    reservations,
    reservationFinancials,
  } from "@reservation/database";
  import { logger } from "@reservation/logger";
  import type {
    InventoryLockRequestedEvent,
    PaymentRequestedEvent,
  } from "@reservation/contracts";

  import type { RequestReservationCommand } from "../../application/commands/request-reservation.command.js";
  import type { ConfirmReservationCommand } from "../../application/commands/confirm-reservation.command.js";
  import type { RejectReservationCommand } from "../../application/commands/reject-reservation.command.js";
  import type { CompleteReservationPaymentCommand } from "../../application/commands/complete-reservation-payment.command.js";
  import { ReservationMapper } from "../../domain/mappers/reservation.mapper.js";

  import type {
    ConfirmInventoryResult,
    CreateReservationResult,
    ReservationRepository,
  } from "../../application/ports/reservation.repository.js";
  import { ReservationStatus } from "../../domain/reservation-status.js";

  export class DrizzleReservationRepository implements ReservationRepository {

    async createFromRequestCommand(command: RequestReservationCommand): Promise<CreateReservationResult> {

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

        const totalAmount = await this.calculateReservationTotalAmount({
          unitId: command.unitId,
          currencyId: currency.id,
          checkIn: command.checkIn,
          checkOut: command.checkOut,
        });

        const [created] = await tx
          .insert(reservations)
          .values({
            code: command.reservationCode,
            propertyId: command.propertyId,
            unitId: command.unitId,
            guestId: command.guestId,
            channelId: channel.id,
            currencyId: currency.id,
            reservationNumber,
            checkIn: command.checkIn,
            checkOut: command.checkOut,
            status: pendingStatus.id,
            idempotencyKey: command.idempotencyKey,
            correlationId: command.correlationId,
            totalAmount,
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

        await tx
          .insert(reservationFinancials)
          .values({
            reservationId: created.id,
            grossAmount: totalAmount,
            discountAmount: "0.00",
            taxAmount: "0.00",
            platformCommissionAmount: "0.00",
            ownerPayoutAmount: totalAmount,
            currencyId: currency.id,
          });

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

    async confirmInventory(command: ConfirmReservationCommand): Promise<ConfirmInventoryResult> {
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

      if (
        currentStatusCode === ReservationStatus.Confirmed ||
        currentStatusCode === ReservationStatus.Rejected ||
        currentStatusCode === ReservationStatus.Cancelled
      ) {
        logger.info(
          "InventoryLocked ignored because reservation is already finalized",
          {
            reservationId,
            correlationId: command.correlationId,
            currentStatus: currentStatusCode,
          },
        );

        return {
          pendingPaymentRequestOutboxEventId: null,
        };
      }
      
      if (currentStatusCode === ReservationStatus.PaymentRequired) {
        const existingOutboxEvent = await db.query.outboxEvents.findFirst({
          where: and(
            eq(outboxEvents.aggregateType, "reservation"),
            eq(outboxEvents.aggregateId, String(reservationId)),
            eq(outboxEvents.eventType, "PaymentRequested"),
          ),
        });

        return {
          pendingPaymentRequestOutboxEventId:
            existingOutboxEvent &&
            existingOutboxEvent.status !== "PUBLISHED"
              ? existingOutboxEvent.id
              : null,
        };
      }

      if (dbReservation.guestId === null) {
        throw new Error(
          `Reservation cannot request payment without guestId. reservationId=${reservationId}`,
        );
      }

      const amount = Number(dbReservation.totalAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          `Reservation cannot request payment with non-positive totalAmount. reservationId=${reservationId} totalAmount=${dbReservation.totalAmount}`,
        );
      }

      const currency = await db.query.currencies.findFirst({
        where: eq(currencies.id, dbReservation.currencyId),
      });

      if (!currency) {
        throw new Error(
          `Currency not found for reservation payment. reservationId=${reservationId}`,
        );
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

      const updatedReservation = domainReservation
        .confirmInventoryLock()
        .markPaymentRequired();

      const paymentRequiredStatus = await this.getStatusByCode(
        ReservationStatus.PaymentRequired,
      );

      return db.transaction(async (tx) => {
        const [updated] = await tx
          .update(reservations)
          .set({
            status: paymentRequiredStatus.id,
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
            `Reservation payment request transition failed due to concurrent state change. reservationId=${reservationId}`,
          );
        }

        const paymentRequested: PaymentRequestedEvent = {
          eventId: crypto.randomUUID(),
          eventType: "PaymentRequested",
          occurredAt: new Date().toISOString(),
          correlationId: command.correlationId,
          causationId: command.causationId ?? undefined,
          payload: {
            reservationId: String(reservationId),
            guestId: String(dbReservation.guestId),
            currencyCode: currency.code,
            amount,
          },
        };

        const [createdOutboxEvent] = await tx
          .insert(outboxEvents)
          .values({
            aggregateType: "reservation",
            aggregateId: String(reservationId),
            eventType: paymentRequested.eventType,
            payload: paymentRequested,
            status: "PENDING",
            correlationId: command.correlationId,
            causationId: command.causationId,
          })
          .returning({
            id: outboxEvents.id,
          });

        if (!createdOutboxEvent) {
          throw new Error("PaymentRequested outbox creation failed");
        }

        logger.info("Reservation marked as PAYMENT_REQUIRED", {
          reservationId,
          correlationId: command.correlationId,
        });

        return {
          pendingPaymentRequestOutboxEventId: createdOutboxEvent.id,
        };
      });
    }

    async completeReservationPayment(command: CompleteReservationPaymentCommand): Promise<void> {
      const reservationId = Number(command.reservationId);

      const dbReservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, reservationId),
      });

      if (!dbReservation) {
        throw new Error(
          `Reservation not found for PaymentCaptured event. reservationId=${command.reservationId}`,
        );
      }

      const currentStatusCode = await this.getStatusCode(dbReservation.status);

      if (currentStatusCode === ReservationStatus.Confirmed) {
        logger.info(
          "PaymentCaptured ignored because reservation is already CONFIRMED",
          {
            reservationId,
            correlationId: command.correlationId,
            paymentId: command.paymentId,
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

      const confirmedReservation = domainReservation.confirm();

      const confirmedStatus = await this.getStatusByCode(
        ReservationStatus.Confirmed,
      );

      const [updated] = await db
        .update(reservations)
        .set({
          status: confirmedStatus.id,
          rejectionReason: confirmedReservation.rejectionReason ?? null,
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
          `Reservation confirmation after payment failed due to concurrent state change. reservationId=${reservationId}`,
        );
      }

      logger.info("Reservation marked as CONFIRMED after payment capture", {
        reservationId,
        correlationId: command.correlationId,
        paymentId: command.paymentId,
      });
    }

    async rejectReservation(command: RejectReservationCommand): Promise<void> {
      const reservationId = Number(command.reservationId);

      const dbReservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, reservationId),
      });

      if (!dbReservation) {
        throw new Error(
          `Reservation not found for rejection event. reservationId=${command.reservationId}`,
        );
      }

      const currentStatusCode = await this.getStatusCode(dbReservation.status);

      if (currentStatusCode === ReservationStatus.Rejected) {
        logger.info(
          "Rejection event ignored because reservation is already REJECTED",
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

    private async calculateReservationTotalAmount(params: {
      unitId: number;
      currencyId: number;
      checkIn: string;
      checkOut: string;
    }): Promise<string> {
      const unit = await db.query.units.findFirst({
        where: eq(units.id, params.unitId),
      });

      if (!unit) {
        throw new Error(`Unit not found: ${params.unitId}`);
      }

      const checkInDate = new Date(`${params.checkIn}T00:00:00.000Z`);
      const checkOutDate = new Date(`${params.checkOut}T00:00:00.000Z`);

      const nights = Math.floor(
        (checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000,
      );

      if (nights <= 0) {
        throw new Error(
          `Invalid reservation nights. checkIn=${params.checkIn} checkOut=${params.checkOut}`,
        );
      }

      const seasonalRates = await db
        .select({
          date: unitDailyRates.date,
          pricePerNight: unitDailyRates.pricePerNight,
        })
        .from(unitDailyRates)
        .where(sql`
          ${unitDailyRates.unitId} = ${params.unitId}
          and ${unitDailyRates.currencyId} = ${params.currencyId}
          and ${unitDailyRates.date} >= ${checkInDate}
          and ${unitDailyRates.date} < ${checkOutDate}
          and ${unitDailyRates.isAvailable} = true
        `);

      const ratesByDay = new Map(
        seasonalRates.map((rate) => [
          rate.date.toISOString().slice(0, 10),
          rate.pricePerNight,
        ]),
      );

      let grossAmount = 0;

      for (let offset = 0; offset < nights; offset++) {
        const currentDate = new Date(checkInDate);
        currentDate.setUTCDate(checkInDate.getUTCDate() + offset);

        const key = currentDate.toISOString().slice(0, 10);
        const nightlyRate = ratesByDay.get(key) ?? unit.basePricePerNight;

        grossAmount += nightlyRate;
      }

      return grossAmount.toFixed(2);
    }
  }