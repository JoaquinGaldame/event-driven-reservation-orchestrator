import type { PaymentStatus } from "./payment-status.js";


export class UnassociatedReservationError extends Error {
  constructor(internalCode: string) {
    super(`Payment ${internalCode} is not associated with a reservation`);
    this.name = "UnassociatedReservationError";
  }
}

export class InvalidPaymentTransitionError extends Error {
  constructor(currentStatus: string, nextStatus: string) {
    super(`Invalid Payment transition. Current=${currentStatus} Next=${nextStatus}`);
    this.name= "InvalidPaymentTransitionError";
  }
}

export class PaymentAlreadyFinalizedError extends Error {
  constructor(status: string){
    super(`Payment is already made. Status=${status}`);
    this.name = "PaymentAlreadyMadeError";
  }
}