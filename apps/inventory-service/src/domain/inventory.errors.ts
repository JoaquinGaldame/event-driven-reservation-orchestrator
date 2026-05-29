  export class InvalidInventoryLockDateRangeError extends Error {
    constructor(checkIn: string, checkOut: string) {
      super(`Invalid inventory lock date range. checkIn=${checkIn} checkOut=${checkOut}`);
      this.name = "InvalidInventoryLockDateRangeError";
    }
  }

  export class InvalidInventoryLockTransitionError extends Error {
    constructor(currentStatus: string, nextStatus: string) {
      super(`Invalid inventory lock transition. current=${currentStatus} next=${nextStatus}`);
      this.name = "InvalidInventoryLockTransitionError";
    }
  }

  export class InventoryLockAlreadyFinalizedError extends Error {
    constructor(status: string) {
      super(`Inventory lock is already finalized. status=${status}`);
      this.name = "InventoryLockAlreadyFinalizedError";
    }
  }
