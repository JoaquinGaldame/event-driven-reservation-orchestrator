import {
    InventoryLockStatus,
    isTerminalInventoryLockStatus,
  } from "./inventory-lock-status.js";
  import {
    InvalidInventoryLockDateRangeError,
    InvalidInventoryLockTransitionError,
    InventoryLockAlreadyFinalizedError,
  } from "./inventory.errors.js";

  export function assertValidInventoryLockDateRange(
    checkIn: string,
    checkOut: string,
  ): void {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      throw new InvalidInventoryLockDateRangeError(checkIn, checkOut);
    }

    if (checkOutDate <= checkInDate) {
      throw new InvalidInventoryLockDateRangeError(checkIn, checkOut);
    }
  }

  export function assertCanTransitionInventoryLockStatus(
    currentStatus: InventoryLockStatus,
    nextStatus: InventoryLockStatus,
  ): void {
    if (currentStatus === nextStatus) {
      return;
    }

    if (isTerminalInventoryLockStatus(currentStatus)) {
      throw new InventoryLockAlreadyFinalizedError(currentStatus);
    }

    const allowedTransitions: Record<InventoryLockStatus, InventoryLockStatus[]> = {
      [InventoryLockStatus.Active]: [
        InventoryLockStatus.Released,
        InventoryLockStatus.Expired,
        InventoryLockStatus.Cancelled,
      ],
      [InventoryLockStatus.Released]: [],
      [InventoryLockStatus.Expired]: [],
      [InventoryLockStatus.Cancelled]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new InvalidInventoryLockTransitionError(currentStatus, nextStatus);
    }
  }