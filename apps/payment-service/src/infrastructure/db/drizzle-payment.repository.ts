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

import type { ProcessPaymentCommand } from "../../application/commands/process-payment.comand.js";
import type {
  PaymentRepository,
  ProcessPaymentResult,
} from "../../application/ports/payment.repository.js";
import { Payment } from "../../domain/payment.entity.js";
import { PaymentStatus } from "../../domain/payment-status.js";

export class DrizzlePaymentRepository implements PaymentRepository {
  async processPayment(
    command: ProcessPaymentCommand,
  ): Promise<ProcessPaymentResult> {
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
        failureReason: status === PaymentStatus.Confirmed ? null : "PAYMENT_DECLINED",
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

    const provider = "mock-gateway";
    const nowIso = new Date().toISOString();

    const domainPayment = Payment.request({
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
    }).confirm(nowIso);

    return db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payments)
        .values({
          internalCode: domainPayment.internalCode,
          reservationId: domainPayment.reservationId,
          provider: domainPayment.provider,
          providerPaymentId: domainPayment.providerPaymentId ?? null,
          providerReference: domainPayment.providerReference ?? null,
          externalReceiptNumber: domainPayment.externalReceiptNumber ?? null,
          currencyId: currency.id,
          amount: domainPayment.amount,
          statusId: pendingStatus.id,
          causationId: domainPayment.causationId ?? null,
          correlationId: domainPayment.correlationId,
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
          statusId: confirmedStatus.id,
          capturedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, createdPayment.id))
        .returning({
          id: payments.id,
        });

      if (!updatedPayment) {
        throw new Error("Payment status update failed inside transaction");
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

      const [createdOutbox] = await tx
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

      if (!createdOutbox) {
        throw new Error("PaymentCaptured outbox creation failed");
      }

      return {
        outcome: "CAPTURED" as const,
        payment: {
          id: createdPayment.id,
          internalCode: domainPayment.internalCode,
          reservationId: command.reservationId,
          provider,
          amount: domainPayment.amount,
          currencyCode: command.currencyCode,
          status: PaymentStatus.Confirmed,
        },
        failureReason: null,
        pendingResultOutboxEventId: createdOutbox.id,
      };
    });
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