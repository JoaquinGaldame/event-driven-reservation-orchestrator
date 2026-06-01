import type {
  CreatePaymentRequest,
  PaymentGateway,
  PaymentGatewayResult,
} from "../../application/ports/payment-gateway.js";

export class MockPaymentGateway implements PaymentGateway {
  readonly provider = "mock-gateway";

  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<PaymentGatewayResult> {
    const shouldFail = request.customerReference === "999999";

    if (shouldFail) {
      return {
        outcome: "REJECTED",
        providerPaymentId: `mock-failed-${request.reservationId}`,
        providerReference: request.paymentId,
        externalReceiptNumber: null,
        reason: "PAYMENT_DECLINED",
        rawResponse: {
          provider: this.provider,
          mocked: true,
          status: "rejected",
        },
      };
    }

    return {
      outcome: "APPROVED",
      providerPaymentId: `mock-approved-${request.reservationId}`,
      providerReference: request.paymentId,
      externalReceiptNumber: `receipt-${request.reservationId}`,
      rawResponse: {
        provider: this.provider,
        mocked: true,
        status: "approved",
      },
    };
  }
}