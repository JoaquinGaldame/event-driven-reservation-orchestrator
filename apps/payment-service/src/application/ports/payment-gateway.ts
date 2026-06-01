export type CreatePaymentRequest = {
  paymentId: string;
  reservationId: number;
  amount: number;
  currencyCode: string;
  customerReference: string;
  idempotencyKey: string;
};

export type PaymentGatewayResult =
| {
    outcome: "APPROVED";
    providerPaymentId: string;
    providerReference?: string | null;
    externalReceiptNumber?: string | null;
    rawResponse?: unknown;
    }
| {
    outcome: "REJECTED";
    providerPaymentId?: string | null;
    providerReference?: string | null;
    externalReceiptNumber?: string | null;
    reason: string;
    rawResponse?: unknown;
    }
| {
    outcome: "PENDING";
    providerPaymentId: string;
    providerReference?: string | null;
    externalReceiptNumber?: string | null;
    rawResponse?: unknown;
    };

export interface PaymentGateway {
  readonly provider: string;
  createPayment(request: CreatePaymentRequest): Promise<PaymentGatewayResult>;
}