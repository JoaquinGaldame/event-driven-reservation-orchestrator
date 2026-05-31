import {
  and,
  currencies,
  db,
  eq,
  outboxEvents,
  paymentStatuses,
  payments,
} from "@reservation/database";
import type {
  PaymentCapturedEvent,
  PaymentFailedEvent,
} from "@reservation/contracts";

import type { ProcessPaymentCommand } from "../../application/commands/process-payment.command.js";
import type {
  PaymentRepository,
  ProcessPaymentResult,
} from "../../application/ports/payment.repository.js";
import { Payment } from "../../domain/payment.entity.js";
import { PaymentStatus } from "../../domain/payment-status.js";

export class DrizzlePaymentRepository implements PaymentRepository {
  
  async processPayment(command: ProcessPaymentCommand): Promise<ProcessPaymentResult> {
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.reservationId, command.reservationId),
    });

    if (existingPayment) {
      const existingOutbox = await db.query.outboxEvents.findFirst({
        where: and(
          eq(outboxEvents.aggregateType, "payment"),
          eq(outboxEvents.aggregateId, String(existingPayment.id)),
        ),
      });

      const status = await this.getStatusCode(existingPayment.statusId);

      return {
        outcome: status === PaymentStatus.Confirmed ? "CAPTURED" : "FAILED",
        payment: {
          id: existingPayment.id,
          internalCode: existingPayment.internalCode,
          reservationId: existingPayment.reservationId,
          provider: existingPayment.provider,
          amount: String(existingPayment.amount),
          currencyCode: command.currencyCode,
          status,
        },
        failureReason: status === PaymentStatus.Failed ? "PAYMENT_DECLINED" : null,
        pendingResultOutboxEventId:
          existingOutbox && existingOutbox.status !== "PUBLISHED"
            ? existingOutbox.id
            : null,
      };
    }

    const currency = await db.query.currencies.findFirst({
      where: eq(currencies.code, command.currencyCode),
    });

    if (!currency) {
      throw new Error(`Currency not found: ${command.currencyCode}`);
    }

    const pendingStatus = await this.getStatusByCode(PaymentStatus.Pending);
    const confirmedStatus = await this.getStatusByCode(PaymentStatus.Confirmed);
    const failedStatus = await this.getStatusByCode(PaymentStatus.Failed);

    const provider = "mock-gateway";
    const nowIso = new Date().toISOString();

    const shouldFail = this.shouldSimulatePaymentFailure(command);

    const requestedPayment = Payment.request({
      internalCode: crypto.randomUUID(),
      reservationId: command.reservationId,
      provider,
      providerPaymentId: `pay_${command.reservationId}`,
      providerReference: `ref_${command.reservationId}`,
      externalReceiptNumber: `rcpt_${command.reservationId}`,
      currencyCode: command.currencyCode,
      amount: command.amount.toFixed(2),
      causationId: command.causationId,
      correlationId: command.correlationId,
    });

    const settledPayment = shouldFail ? requestedPayment.fail(nowIso) : requestedPayment.confirm(nowIso);

    return db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payments)
        .values({
          internalCode: settledPayment.internalCode,
          reservationId: settledPayment.reservationId,
          provider: settledPayment.provider,
          providerPaymentId: settledPayment.providerPaymentId ?? null,
          providerReference: settledPayment.providerReference ?? null,
          externalReceiptNumber: settledPayment.externalReceiptNumber ?? null,
          currencyId: currency.id,
          amount: settledPayment.amount,
          statusId: pendingStatus.id,
          causationId: settledPayment.causationId ?? null,
          correlationId: settledPayment.correlationId,
          authorizedAt: null,
          capturedAt: null,
          failedAt: null,
          cancelledAt: null,
        })
        .returning({
          id: payments.id,
          internalCode: payments.internalCode,
          reservationId: payments.reservationId,
        });

      if (!createdPayment) {
        throw new Error("Payment creation failed inside transaction");
      }

      const [updatedPayment] = await tx
        .update(payments)
        .set({
          statusId: shouldFail ? failedStatus.id : confirmedStatus.id,
          capturedAt: shouldFail ? null : new Date(),
          failedAt: shouldFail ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, createdPayment.id))
        .returning({
          id: payments.id,
        });

      if (!updatedPayment) {
        throw new Error("Payment status update failed inside transaction");
      }

      if (shouldFail) {
        const failedEvent: PaymentFailedEvent = {
          eventId: crypto.randomUUID(),
          eventType: "PaymentFailed",
          occurredAt: new Date().toISOString(),
          correlationId: command.correlationId,
          causationId: command.causationId,
          payload: {
            paymentId: String(createdPayment.id),
            reservationId: String(command.reservationId),
            reason: "PAYMENT_DECLINED",
          },
        };

        const [failedOutbox] = await tx
          .insert(outboxEvents)
          .values({
            aggregateType: "payment",
            aggregateId: String(createdPayment.id),
            eventType: failedEvent.eventType,
            payload: failedEvent,
            status: "PENDING",
            correlationId: command.correlationId,
            causationId: command.causationId,
          })
          .returning({
            id: outboxEvents.id,
          });

        if (!failedOutbox) {
          throw new Error("PaymentFailed outbox creation failed");
        }

        return {
          outcome: "FAILED" as const,
          payment: {
            id: createdPayment.id,
            internalCode: settledPayment.internalCode,
            reservationId: command.reservationId,
            provider,
            amount: settledPayment.amount,
            currencyCode: command.currencyCode,
            status: PaymentStatus.Failed,
          },
          failureReason: "PAYMENT_DECLINED",
          pendingResultOutboxEventId: failedOutbox.id,
        };
      }

      const capturedEvent: PaymentCapturedEvent = {
        eventId: crypto.randomUUID(),
        eventType: "PaymentCaptured",
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        causationId: command.causationId,
        payload: {
          paymentId: String(createdPayment.id),
          reservationId: String(command.reservationId),
        },
      };

      const [capturedOutbox] = await tx
        .insert(outboxEvents)
        .values({
          aggregateType: "payment",
          aggregateId: String(createdPayment.id),
          eventType: capturedEvent.eventType,
          payload: capturedEvent,
          status: "PENDING",
          correlationId: command.correlationId,
          causationId: command.causationId,
        })
        .returning({
          id: outboxEvents.id,
        });

      if (!capturedOutbox) {
        throw new Error("PaymentCaptured outbox creation failed");
      }

      return {
        outcome: "CAPTURED" as const,
        payment: {
          id: createdPayment.id,
          internalCode: settledPayment.internalCode,
          reservationId: command.reservationId,
          provider,
          amount: settledPayment.amount,
          currencyCode: command.currencyCode,
          status: PaymentStatus.Confirmed,
        },
        failureReason: null,
        pendingResultOutboxEventId: capturedOutbox.id,
      };
    });
  }

  private shouldSimulatePaymentFailure(command: ProcessPaymentCommand): boolean {
    return command.guestId === 999999;
  }

  private async getStatusByCode(code: PaymentStatus) {
    const status = await db.query.paymentStatuses.findFirst({
      where: eq(paymentStatuses.code, code),
    });

    if (!status) {
      throw new Error(`Payment status not found: ${code}`);
    }

    return status;
  }

  private async getStatusCode(statusId: number): Promise<PaymentStatus> {
    const status = await db.query.paymentStatuses.findFirst({
      where: eq(paymentStatuses.id, statusId),
    });

    if (!status) {
      throw new Error(`Payment status not found. id=${statusId}`);
    }

    return status.code as PaymentStatus;
  }
}