import { and, currencies, db, eq, outboxEvents, paymentStatuses, payments } from "@reservation/database";
import type { PaymentCapturedEvent, PaymentFailedEvent } from "@reservation/contracts";
import type { ProcessPaymentCommand } from "../../application/commands/process-payment.command.js";
import type { PaymentRepository, PaymentProjection, CreatePendingPaymentResult, RegisterGatewayResult } from "../../application/ports/payment.repository.js";
import { isTerminalPaymentStatus, PaymentStatus } from "../../domain/payment-status.js";
import { PaymentGatewayResult } from "../../application/ports/payment-gateway.js";
import type { PaymentAttemptRepository, PaymentTransaction } from "../../application/ports/payment-attempt.repository.js";
import { PaymentAttemptStatus } from "../../application/ports/payment-attempt.repository.js";
import { DrizzlePaymentAttemptRepository } from "./drizzle-payment-attempt.repository.js";

export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(
    private readonly paymentAttemptRepository: PaymentAttemptRepository = new DrizzlePaymentAttemptRepository(),
  ) {}

  // CreatePendingPayment is used to create a new payment in pending status before calling the payment gateway.
  async createPendingPayment(command: ProcessPaymentCommand, provider: string): Promise<CreatePendingPaymentResult> {
    return db.transaction(async (tx) => {
      const [existingPayment] = await tx
        .select({
          id: payments.id,
          internalCode: payments.internalCode,
          reservationId: payments.reservationId,
          provider: payments.provider,
          amount: payments.amount,
          statusId: payments.statusId,
        })
        .from(payments)
        .where(eq(payments.reservationId, command.reservationId));

      if (existingPayment) {
        const status = await this.getStatusCode(existingPayment.statusId);
        const pendingOutboxEventId = await this.getPendingResultOutboxEventId(
          existingPayment.id,
          tx,
        );

        if (isTerminalPaymentStatus(status)) {
          return {
            payment: this.toPaymentProjection(
              existingPayment,
              command.currencyCode,
              status,
            ),
            attemptId: null,
            shouldProcessGateway: false,
            pendingResultOutboxEventId: pendingOutboxEventId,
          };
        }

        if (status !== PaymentStatus.Pending && status !== PaymentStatus.Authorized){
          return {
            payment: this.toPaymentProjection(
              existingPayment,
              command.currencyCode,
              status,
            ),
            attemptId: null,
            shouldProcessGateway: false,
            pendingResultOutboxEventId: pendingOutboxEventId,
          };
        }

        const attempt = await this.paymentAttemptRepository.createPendingAttempt(
          {
            paymentId: existingPayment.id,
            provider: existingPayment.provider,
            requestPayload: this.buildAttemptRequestPayload(command),
            correlationId: command.correlationId,
          },
          tx,
        );

        return {
          payment: this.toPaymentProjection(
            existingPayment,
            command.currencyCode,
            status,
          ),
          attemptId: attempt.id,
          shouldProcessGateway: true,
          pendingResultOutboxEventId: pendingOutboxEventId,
        };
      }

      const [currency] = await tx
        .select({
          id: currencies.id,
        })
        .from(currencies)
        .where(eq(currencies.code, command.currencyCode));

      if (!currency) {
        throw new Error(`Currency not found: ${command.currencyCode}`);
      }

      const pendingStatus = await this.getStatusByCode(PaymentStatus.Pending);

      const [createdPayment] = await tx
        .insert(payments)
        .values({
          internalCode: crypto.randomUUID(),
          reservationId: command.reservationId,
          provider,
          providerPaymentId: null,
          providerReference: null,
          externalReceiptNumber: null,
          currencyId: currency.id,
          amount: command.amount.toFixed(2),
          statusId: pendingStatus.id,
          causationId: command.causationId,
          correlationId: command.correlationId,
          authorizedAt: null,
          capturedAt: null,
          failedAt: null,
          cancelledAt: null,
        })
        .returning({
          id: payments.id,
          internalCode: payments.internalCode,
          reservationId: payments.reservationId,
          provider: payments.provider,
          amount: payments.amount,
        });

      if (!createdPayment) {
        throw new Error("Payment creation failed");
      }

      const attempt = await this.paymentAttemptRepository.createPendingAttempt(
        {
          paymentId: createdPayment.id,
          provider,
          requestPayload: this.buildAttemptRequestPayload(command),
          correlationId: command.correlationId,
        },
        tx,
      );

      return {
        payment: this.toPaymentProjection(
          createdPayment,
          command.currencyCode,
          PaymentStatus.Pending,
        ),
        attemptId: attempt.id,
        shouldProcessGateway: true,
        pendingResultOutboxEventId: null,
      };
    });
  }

  // RegisterGatewayResult is used to update the payment with the result from the payment gateway and return the outcome.
  async registerGatewayResult(params: {
    paymentId: number;
    attemptId: number;
    gatewayResult: PaymentGatewayResult;
    causationId: string;
    correlationId: string;
    currencyCode: string;
  }): Promise<RegisterGatewayResult> {
    return db.transaction(async (tx) => {
      const [existingPayment] = await tx
        .select({
          id: payments.id,
          internalCode: payments.internalCode,
          reservationId: payments.reservationId,
          provider: payments.provider,
          amount: payments.amount,
          statusId: payments.statusId,
        })
        .from(payments)
        .where(eq(payments.id, params.paymentId));

      if (!existingPayment) {
        throw new Error(`Payment not found: ${params.paymentId}`);
      }

      const currentStatus = await this.getStatusCode(existingPayment.statusId);

      if (isTerminalPaymentStatus(currentStatus)) {
        return {
          outcome:
            currentStatus === PaymentStatus.Confirmed ? "CAPTURED" : "FAILED",
          payment: this.toPaymentProjection(
            existingPayment,
            params.currencyCode,
            currentStatus,
          ),
          failureReason:
            currentStatus === PaymentStatus.Failed
              ? "PAYMENT_DECLINED"
              : null,
          pendingResultOutboxEventId: await this.getPendingResultOutboxEventId(
            existingPayment.id,
            tx,
          ),
        };
      }

      if (params.gatewayResult.outcome === "PENDING") {
        await tx
          .update(payments)
          .set({
            providerPaymentId: params.gatewayResult.providerPaymentId,
            providerReference: params.gatewayResult.providerReference ?? null,
            externalReceiptNumber:
              params.gatewayResult.externalReceiptNumber ?? null,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id));

        await this.paymentAttemptRepository.completeAttempt(
          {
            attemptId: params.attemptId,
            responsePayload:
              params.gatewayResult.rawResponse ?? params.gatewayResult,
            status: PaymentAttemptStatus.Succeeded,
            errorCode: null,
            errorMessage: null,
          },
          tx,
        );

        return {
          outcome: "PENDING",
          payment: this.toPaymentProjection(
            existingPayment,
            params.currencyCode,
            PaymentStatus.Pending,
          ),
          failureReason: null,
          pendingResultOutboxEventId: null,
        };
      }

      if (params.gatewayResult.outcome === "REJECTED") {
        const failedStatus = await this.getStatusByCode(PaymentStatus.Failed);

        const [updatedPayment] = await tx
          .update(payments)
          .set({
            statusId: failedStatus.id,
            providerPaymentId: params.gatewayResult.providerPaymentId ?? null,
            providerReference: params.gatewayResult.providerReference ?? null,
            externalReceiptNumber:
              params.gatewayResult.externalReceiptNumber ?? null,
            failedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id))
          .returning({
            id: payments.id,
            internalCode: payments.internalCode,
            reservationId: payments.reservationId,
            provider: payments.provider,
            amount: payments.amount,
          });

        if (!updatedPayment) {
          throw new Error("Payment rejection update failed");
        }

        await this.paymentAttemptRepository.completeAttempt(
          {
            attemptId: params.attemptId,
            responsePayload:
              params.gatewayResult.rawResponse ?? params.gatewayResult,
            status: PaymentAttemptStatus.Failed,
            errorCode: "PAYMENT_DECLINED",
            errorMessage: params.gatewayResult.reason,
          },
          tx,
        );

        const failedEvent: PaymentFailedEvent = {
          eventId: crypto.randomUUID(),
          eventType: "PaymentFailed",
          occurredAt: new Date().toISOString(),
          correlationId: params.correlationId,
          causationId: params.causationId,
          payload: {
            paymentId: String(updatedPayment.id),
            reservationId: String(updatedPayment.reservationId),
            reason: params.gatewayResult.reason,
          },
        };

        const [createdOutbox] = await tx
          .insert(outboxEvents)
          .values({
            aggregateType: "payment",
            aggregateId: String(updatedPayment.id),
            eventType: failedEvent.eventType,
            payload: failedEvent,
            status: "PENDING",
            correlationId: params.correlationId,
            causationId: params.causationId,
          })
          .returning({
            id: outboxEvents.id,
          });

        if (!createdOutbox) {
          throw new Error("PaymentFailed outbox creation failed");
        }

        return {
          outcome: "FAILED",
          payment: this.toPaymentProjection(
            updatedPayment,
            params.currencyCode,
            PaymentStatus.Failed,
          ),
          failureReason: params.gatewayResult.reason,
          pendingResultOutboxEventId: createdOutbox.id,
        };
      }

      const confirmedStatus = await this.getStatusByCode(PaymentStatus.Confirmed);

      const [updatedPayment] = await tx
        .update(payments)
        .set({
          statusId: confirmedStatus.id,
          providerPaymentId: params.gatewayResult.providerPaymentId,
          providerReference: params.gatewayResult.providerReference ?? null,
          externalReceiptNumber:
            params.gatewayResult.externalReceiptNumber ?? null,
          capturedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id))
        .returning({
          id: payments.id,
          internalCode: payments.internalCode,
          reservationId: payments.reservationId,
          provider: payments.provider,
          amount: payments.amount,
        });

      if (!updatedPayment) {
        throw new Error("Payment capture update failed");
      }

      await this.paymentAttemptRepository.completeAttempt(
        {
          attemptId: params.attemptId,
          responsePayload:
            params.gatewayResult.rawResponse ?? params.gatewayResult,
          status: PaymentAttemptStatus.Succeeded,
          errorCode: null,
          errorMessage: null,
        },
        tx,
      );

      const capturedEvent: PaymentCapturedEvent = {
        eventId: crypto.randomUUID(),
        eventType: "PaymentCaptured",
        occurredAt: new Date().toISOString(),
        correlationId: params.correlationId,
        causationId: params.causationId,
        payload: {
          paymentId: String(updatedPayment.id),
          reservationId: String(updatedPayment.reservationId),
        },
      };

      const [createdOutbox] = await tx
        .insert(outboxEvents)
        .values({
          aggregateType: "payment",
          aggregateId: String(updatedPayment.id),
          eventType: capturedEvent.eventType,
          payload: capturedEvent,
          status: "PENDING",
          correlationId: params.correlationId,
          causationId: params.causationId,
        })
        .returning({
          id: outboxEvents.id,
        });

      if (!createdOutbox) {
        throw new Error("PaymentCaptured outbox creation failed");
      }

      return {
        outcome: "CAPTURED",
        payment: this.toPaymentProjection(
          updatedPayment,
          params.currencyCode,
          PaymentStatus.Confirmed,
        ),
        failureReason: null,
        pendingResultOutboxEventId: createdOutbox.id,
      };
    });
  }
  
  private buildAttemptRequestPayload(command: ProcessPaymentCommand) {
    return {
      reservationId: command.reservationId,
      guestId: command.guestId,
      currencyCode: command.currencyCode,
      amount: command.amount,
      correlationId: command.correlationId,
    };
  }

  private toPaymentProjection(
    payment: {
      id: number;
      internalCode: string;
      reservationId: number;
      provider: string;
      amount: unknown;
    },
    currencyCode: string,
    status: PaymentStatus,
  ): PaymentProjection {
    return {
      id: payment.id,
      internalCode: payment.internalCode,
      reservationId: payment.reservationId,
      provider: payment.provider,
      amount: String(payment.amount),
      currencyCode,
      status,
    };
  }

  private async getPendingResultOutboxEventId(paymentId: number, tx: PaymentTransaction): Promise<number | null> {
    const [outboxEvent] = await tx
      .select({
        id: outboxEvents.id,
        status: outboxEvents.status,
      })
      .from(outboxEvents)
      .where(
        and(
          eq(outboxEvents.aggregateType, "payment"),
          eq(outboxEvents.aggregateId, String(paymentId)),
        ),
      );

    if (!outboxEvent || outboxEvent.status === "PUBLISHED") {
      return null;
    }

    return outboxEvent.id;
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