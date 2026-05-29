  import { InventoryLockStatus } from "./inventory-lock-status.js";
  import {
    assertCanTransitionInventoryLockStatus,
    assertValidInventoryLockDateRange,
  } from "./inventory-lock-rules.js";

  export type InventoryLockProps = {
    id?: number;
    reservationId: number;
    propertyId: number;
    unitId: number;
    lockTypeCode: string;
    status: InventoryLockStatus;
    checkIn: string;
    checkOut: string;
    expiresAt?: string | null;
    releasedAt?: string | null;
    correlationId: string;
  };

  export class InventoryLock {
    private constructor(private readonly props: InventoryLockProps) {
      assertValidInventoryLockDateRange(props.checkIn, props.checkOut);
    }

    static request(
      props: Omit<InventoryLockProps, "status" | "releasedAt">,
    ): InventoryLock {
      return new InventoryLock({
        ...props,
        status: InventoryLockStatus.Active,
        releasedAt: null,
      });
    }

    static restore(props: InventoryLockProps): InventoryLock {
      return new InventoryLock(props);
    }

    release(releasedAt: string): InventoryLock {
      assertCanTransitionInventoryLockStatus(
        this.props.status,
        InventoryLockStatus.Released,
      );

      return new InventoryLock({
        ...this.props,
        status: InventoryLockStatus.Released,
        releasedAt,
      });
    }

    expire(): InventoryLock {
      assertCanTransitionInventoryLockStatus(
        this.props.status,
        InventoryLockStatus.Expired,
      );

      return new InventoryLock({
        ...this.props,
        status: InventoryLockStatus.Expired,
      });
    }

    cancel(): InventoryLock {
      assertCanTransitionInventoryLockStatus(
        this.props.status,
        InventoryLockStatus.Cancelled,
      );

      return new InventoryLock({
        ...this.props,
        status: InventoryLockStatus.Cancelled,
      });
    }

    toPrimitives(): InventoryLockProps {
      return { ...this.props };
    }

    get id(): number | undefined {
      return this.props.id;
    }

    get reservationId(): number {
      return this.props.reservationId;
    }

    get propertyId(): number {
      return this.props.propertyId;
    }

    get unitId(): number {
      return this.props.unitId;
    }

    get lockTypeCode(): string {
      return this.props.lockTypeCode;
    }

    get status(): InventoryLockStatus {
      return this.props.status;
    }

    get checkIn(): string {
      return this.props.checkIn;
    }

    get checkOut(): string {
      return this.props.checkOut;
    }

    get correlationId(): string {
      return this.props.correlationId;
    }

    get expiresAt(): string | null | undefined {
      return this.props.expiresAt;
    }

    get releasedAt(): string | null | undefined {
      return this.props.releasedAt;
    }
  }
