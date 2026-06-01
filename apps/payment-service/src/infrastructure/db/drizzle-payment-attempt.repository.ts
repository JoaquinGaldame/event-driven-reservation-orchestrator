import { db, eq, paymentAttempts, paymentsAttemptsStatuses, sql } from "@reservation/database";
import type { CompleteAttemptParams, CreatePendingAttemptParams, PaymentAttemptRepository, PaymentAttemptStatus, PaymentTransaction } from "../../application/ports/payment-attempt.repository.js";


export class DrizzlePaymentAttemptRepository implements PaymentAttemptRepository
{

  // Calculate the next attempt number in SQL to avoid loading all attempts in memory.
  async getNextAttemptNumber(paymentId: number, tx: PaymentTransaction): Promise<number> {
    const [result] = await tx
      .select({
        nextAttemptNumber:
          sql<number>`coalesce(max(${paymentAttempts.attemptNumber}), 0) + 1`,
      })
      .from(paymentAttempts)
      .where(eq(paymentAttempts.paymentId, paymentId));

    return result?.nextAttemptNumber ?? 1;
  }

  // This method creates a new pending payment attempt in the database with the provided parameters. 
  // It first retrieves the status ID for the "PENDING" status, then inserts a new record into the paymentAttempts table with the given paymentId, provider, requestPayload, and correlationId. 
  // The responsePayload, errorCode, and errorMessage are set to null, and the statusId is set to the retrieved pendingStatusId. Finally, it returns the ID and attempt number of the created attempt.
  async createPendingAttempt( params: CreatePendingAttemptParams, tx: PaymentTransaction): Promise<{ id: number; attemptNumber: number }> {
    const pendingStatusId = await this.getAttemptStatusIdByCode("PENDING");

    for (let retry = 0; retry < 2; retry++) {
      const attemptNumber = await this.getNextAttemptNumber(params.paymentId, tx);

      try {
        const [createdAttempt] = await tx
          .insert(paymentAttempts)
          .values({
            paymentId: params.paymentId,
            attemptNumber,
            provider: params.provider,
            requestPayload: params.requestPayload,
            responsePayload: null,
            statusId: pendingStatusId,
            errorCode: null,
            errorMessage: null,
            correlationId: params.correlationId,
          })
          .returning({
            id: paymentAttempts.id,
            attemptNumber: paymentAttempts.attemptNumber,
          });

        if (!createdAttempt) {
          throw new Error("Payment attempt creation failed");
        }

        return createdAttempt;
      } catch (error) {
        if (retry === 0 && this.isDuplicateAttemptNumberError(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Payment attempt creation failed after retry");
  }

  // This method updates an existing payment attempt in the database with the provided parameters. 
  // It first retrieves the status ID corresponding to the provided status code, then updates the record in the paymentAttempts table that matches the given attemptId. 
  // The responsePayload, statusId, errorCode, and errorMessage fields are updated with the provided values. If the status code is invalid and does not correspond to any existing status, an error is thrown.
  async completeAttempt(params: CompleteAttemptParams, tx: PaymentTransaction): Promise<void> {
    const statusId = await this.getAttemptStatusIdByCode(params.status);

    await tx
      .update(paymentAttempts)
      .set({
        responsePayload: params.responsePayload,
        statusId,
        errorCode: params.errorCode ?? null,
        errorMessage: params.errorMessage ?? null,
      })
      .where(eq(paymentAttempts.id, params.attemptId));
  }

  private isDuplicateAttemptNumberError(error: unknown): boolean {
    if (!error || typeof error !== "object") {
      return false;
    }

    const dbError = error as {
      code?: string;
      constraint?: string;
    };

    return (
      dbError.code === "23505" &&
      dbError.constraint === "payment_attempts_payment_attempt_number_uq"
    );
  }


  private async getAttemptStatusIdByCode( code: PaymentAttemptStatus ): Promise<number> {
    const status = await db.query.paymentsAttemptsStatuses.findFirst({
      where: eq(paymentsAttemptsStatuses.code, code),
    });

    if (!status) {
      throw new Error(`Payment attempt status not found: ${code}`);
    }

    return status.id;
  }
}
