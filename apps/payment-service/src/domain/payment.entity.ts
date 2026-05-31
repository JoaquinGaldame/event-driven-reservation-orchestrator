import { PaymentStatus } from "./payment-status.js";
import { assertCanTransitionPaymentStatus, assertAssociatedReservation } from "./payment-rules.js";

export type PaymentProps = {
  id?: number;
  internalCode: string;
  reservationId: number;
  provider: string;
  providerPaymentId: string;
  providerReference: string;
  externalReceiptNumber: string;
  currencyCode: string;
  amount: string;
  status: PaymentStatus;
  causationId: string;
  correlationId: string;
  authorizedAt?: string | null;
  capturedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
}

export type RequestPaymentProps = Omit<
  PaymentProps,
  | "id"
  | "status"
  | "authorizedAt"
  | "capturedAt"
  | "failedAt"
  | "cancelledAt"
>;

export class Payment {
  private constructor(private readonly props: PaymentProps) {
    assertAssociatedReservation(props.internalCode, props.reservationId)
  }


  static request(props: RequestPaymentProps): Payment {
    return new Payment({
      ...props,
      status: PaymentStatus.Pending,
      providerPaymentId: props.providerPaymentId ?? null,
      providerReference: props.providerReference ?? null,
      externalReceiptNumber: props.externalReceiptNumber ?? null,
      causationId: props.causationId ?? null,
      authorizedAt: null,
      capturedAt: null,
      failedAt: null,
      cancelledAt: null,
    });
  }

  static restore(props: PaymentProps): Payment {
    return new Payment(props);
  }

  authorize(authorizedAt: string): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Authorized,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Authorized,
      authorizedAt,
    });
  }

  confirm(capturedAt: string): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Confirmed,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Confirmed,
      capturedAt,
    });
  }

  fail(failedAt: string): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Failed,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Failed,
      failedAt,
    });
  }

  cancel(cancelledAt: string): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Cancelled,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Cancelled,
      cancelledAt,
    });
  }

  expire(failedAt: string): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Expired,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Expired,
      failedAt,
    });
  }

  refunded(): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.Refunded,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.Refunded,
    });
  }

  partiallyRefunded(): Payment {
    assertCanTransitionPaymentStatus(
      this.props.status,
      PaymentStatus.PartiallyRefunded,
    );

    return new Payment({
      ...this.props,
      status: PaymentStatus.PartiallyRefunded,
    });
  }

  toPrimitives(): PaymentProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get internalCode(): string {
    return this.props.internalCode;
  }

  get reservationId(): number {
    return this.props.reservationId;
  }

  get provider(): string {
    return this.props.provider;
  }

  get providerPaymentId(): string {
    return this.props.providerPaymentId;
  }

  get providerReference(): string {
    return this.props.providerReference;
  }

  get externalReceiptNumber(): string {
    return this.props.externalReceiptNumber;
  }

  get currencyCode(): string {
    return this.props.currencyCode;
  }

  get amount(): string {
    return this.props.amount;
  }


  get status(): PaymentStatus {
    return this.props.status;
  }

  get causationId(): string {
    return this.props.causationId;
  }

  get correlationId(): string {
    return this.props.correlationId;
  }


  get authorizedAt(): string | null | undefined {
    return this.props.authorizedAt;
  }

  get capturedAt(): string | null | undefined {
    return this.props.capturedAt;
  }

  get failedAt(): string | null | undefined {
    return this.props.failedAt;
  }

  get cancelledAt(): string | null | undefined {
    return this.props.cancelledAt;
  }

}