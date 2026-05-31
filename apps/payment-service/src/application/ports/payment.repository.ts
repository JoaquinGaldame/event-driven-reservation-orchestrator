import { ProcessPaymentCommand } from "../commands/process-payment.command.js";


export type CreatedPayment = {
  id: number;
  internalCode: string;
  reservationId: number;
  provider: string;
  amount: string;
  currencyCode: string;
  status: string;
};

export type ProcessPaymentResult = {
  outcome: "CAPTURED" | "FAILED";
  payment: CreatedPayment | null;
  failureReason: string | null;
  pendingResultOutboxEventId: number | null;
};

export interface PaymentRepository {
  processPayment(command: ProcessPaymentCommand): Promise<ProcessPaymentResult>;
}