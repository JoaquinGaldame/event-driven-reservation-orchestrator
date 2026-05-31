import { PaymentStatus, isTerminalPaymentStatus } from "./payment-status.js";

import { 
  PaymentAlreadyFinalizedError,
  UnassociatedReservationError, 
  InvalidPaymentTransitionError 
} from "./payment.errors.js";

export function assertAssociatedReservation( internalCode: string, reservationId: number ): void {
  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    throw new UnassociatedReservationError(internalCode);
  }
}

export function assertCanTransitionPaymentStatus( currentStatus: PaymentStatus, nextStatus: PaymentStatus) : void {
  if( currentStatus === nextStatus ){
    return;
  }

  if(isTerminalPaymentStatus(currentStatus)){
    throw new PaymentAlreadyFinalizedError(currentStatus);
  }

  const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.Pending]: [
      PaymentStatus.Authorized,
      PaymentStatus.Cancelled,
      PaymentStatus.Confirmed,
      PaymentStatus.Failed,
      PaymentStatus.Expired,
    ],
    [PaymentStatus.Authorized]: [
      PaymentStatus.Confirmed,
      PaymentStatus.Failed,
      PaymentStatus.Expired,
      PaymentStatus.Cancelled
    ],
    [PaymentStatus.Confirmed]: [
      PaymentStatus.Refunded,
      PaymentStatus.PartiallyRefunded
    ],
    [PaymentStatus.PartiallyRefunded]: [
      PaymentStatus.Refunded
    ],
    [PaymentStatus.Failed]: [],
    [PaymentStatus.Cancelled]: [],
    [PaymentStatus.Refunded]: [],
    [PaymentStatus.Expired]: []
  }

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new InvalidPaymentTransitionError(currentStatus, nextStatus);
  }
}