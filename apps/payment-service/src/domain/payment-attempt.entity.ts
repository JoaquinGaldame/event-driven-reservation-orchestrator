export const PaymentAttemptStatus = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Succeeded: "SUCCEEDED",
  Failed: "FAILED",
  Cancelled: "CANCELLED",
} as const;

export type PaymentAttemptStatus =
  (typeof PaymentAttemptStatus)[keyof typeof PaymentAttemptStatus];

export type PaymentAttemptProps = {
  id?: number;
  paymentId: number;
  attemptNumber: number;
  provider: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  status: PaymentAttemptStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  correlationId: string;
};

export class PaymentAttempt {
  constructor(private readonly props: PaymentAttemptProps) {}

  static createPending(props: Omit<PaymentAttemptProps, "id" | "status" | "responsePayload" | "errorCode" | "errorMessage">): PaymentAttempt {
    return new PaymentAttempt({
      ...props,
      status: PaymentAttemptStatus.Pending,
      responsePayload: null,
      errorCode: null,
      errorMessage: null,
    });
  }

  complete(params: {
    responsePayload: unknown;
    status: PaymentAttemptStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
  }): PaymentAttempt {
    return new PaymentAttempt({
      ...this.props,
      responsePayload: params.responsePayload,
      status: params.status,
      errorCode: params.errorCode ?? null,
      errorMessage: params.errorMessage ?? null,
    });
  }

  toPrimitives(): PaymentAttemptProps {
    return { ...this.props };
  }
}