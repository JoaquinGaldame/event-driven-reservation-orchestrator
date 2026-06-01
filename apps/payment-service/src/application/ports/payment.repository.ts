import type { ProcessPaymentCommand } from "../commands/process-payment.command.js";
import type { PaymentGatewayResult } from "./payment-gateway.js";

export type PaymentProjection = {
  id: number;
  internalCode: string;
  reservationId: number;
  provider: string;
  amount: string;
  currencyCode: string;
  status: string;
};

export type CreatePendingPaymentResult = {
  payment: PaymentProjection;
  attemptId: number | null;
  shouldProcessGateway: boolean;
  pendingResultOutboxEventId: number | null;
};

export type RegisterGatewayResult = {
  outcome: "CAPTURED" | "FAILED" | "PENDING";
  payment: PaymentProjection;
  failureReason: string | null;
  pendingResultOutboxEventId: number | null;
};

export interface PaymentRepository {
  createPendingPayment(
    command: ProcessPaymentCommand,
    provider: string,
  ): Promise<CreatePendingPaymentResult>;

  registerGatewayResult(params: {
    paymentId: number;
    attemptId: number;
    gatewayResult: PaymentGatewayResult;
    causationId: string;
    correlationId: string;
    currencyCode: string;
  }): Promise<RegisterGatewayResult>;
}