import { ReservationStatus } from "./reservation-status.js";
import {
  assertCanTransitionReservationStatus,
  assertValidReservationDateRange,
} from "./reservation-rules.js";

export type ReservationProps = {
  id?: number;
  code: string;
  propertyId: number;
  unitId: number;
  guestId: number | null;
  channelId: number;
  currencyId: number;
  reservationNumber: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  totalAmount: string;
  rejectionReason?: string | null;
  idempotencyKey: string;
  correlationId: string;
};

export class Reservation {
  private constructor(private readonly props: ReservationProps) {
    assertValidReservationDateRange(props.checkIn, props.checkOut);
  }

  static request(props: Omit<ReservationProps, "status" | "rejectionReason">): Reservation {
    return new Reservation({
      ...props,
      status: ReservationStatus.Pending,
      rejectionReason: null,
    });
  }

  static restore(props: ReservationProps): Reservation {
    return new Reservation(props);
  }

  confirmInventoryLock(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.InventoryLocked,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.InventoryLocked,
    });
  }

  markPaymentRequired(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.PaymentRequired,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.PaymentRequired,
    });
  }

  confirm(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Confirmed,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Confirmed,
      rejectionReason: null,
    });
  }

  reject(reason: string): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Rejected,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Rejected,
      rejectionReason: reason,
    });
  }

  cancel(reason?: string): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Cancelled,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Cancelled,
      rejectionReason: reason ?? null,
    });
  }

  toPrimitives(): ReservationProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get reservationNumber(): string {
    return this.props.reservationNumber;
  }

  get status(): ReservationStatus {
    return this.props.status;
  }

  get channelId(): number {
    return this.props.channelId;
  }

  get currencyId(): number {
    return this.props.currencyId;
  }


  get checkIn(): string {
    return this.props.checkIn;
  }

  get checkOut(): string {
    return this.props.checkOut;
  }

  get propertyId(): number {
    return this.props.propertyId;
  }

  get unitId(): number {
    return this.props.unitId;
  }

  get rejectionReason(): string | null | undefined {
    return this.props.rejectionReason;
  }

  get totalAmount(): string {
    return this.props.totalAmount;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get correlationId(): string {
    return this.props.correlationId;
  }
}