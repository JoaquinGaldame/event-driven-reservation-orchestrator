import type { Database } from "@reservation/database";

export const PaymentAttemptStatus = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Succeeded: "SUCCEEDED",
  Failed: "FAILED",
  Cancelled: "CANCELLED",
} as const;

export type PaymentAttemptStatus =(typeof PaymentAttemptStatus)[keyof typeof PaymentAttemptStatus];

export type PaymentTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type CreatePendingAttemptParams = {
  paymentId: number;
  provider: string;
  requestPayload: unknown;
  correlationId: string;
};

export type CompleteAttemptParams = {
  attemptId: number;
  responsePayload: unknown;
  status: PaymentAttemptStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export interface PaymentAttemptRepository {
  getNextAttemptNumber(paymentId: number, tx: PaymentTransaction): Promise<number>;

  createPendingAttempt(params: CreatePendingAttemptParams, tx: PaymentTransaction): Promise<{ id: number; attemptNumber: number }>;

  completeAttempt(params: CompleteAttemptParams, tx: PaymentTransaction): Promise<void>;
}