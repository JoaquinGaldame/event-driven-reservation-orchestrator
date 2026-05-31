import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
  PaymentFailedEvent,
  PaymentCapturedEvent
} from "@reservation/contracts";

import type { RequestReservationCommand } from "../../application/commands/request-reservation.command.js";
import type { ConfirmReservationCommand } from "../../application/commands/confirm-reservation.command.js";
import type { RejectReservationCommand } from "../../application/commands/reject-reservation.command.js";
import type { CompleteReservationPaymentCommand } from "../../application/commands/complete-reservation-payment.command.js";

export function toRequestReservationCommand(
  event: ReservationRequestedEvent,
): RequestReservationCommand {
  return {
    reservationCode: event.payload.reservationId,
    channelCode: event.payload.channelCode,
    currencyCode: event.payload.currencyCode,
    propertyId: Number(event.payload.propertyId),
    unitId: Number(event.payload.unitId),
    guestId: Number(event.payload.guestId),
    checkIn: event.payload.checkIn,
    checkOut: event.payload.checkOut,
    idempotencyKey: event.payload.idempotencyKey,
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}

export function toConfirmReservationCommand( event: InventoryLockedEvent ): ConfirmReservationCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}

export function toCompleteReservationPaymentCommand(
  event: PaymentCapturedEvent,
): CompleteReservationPaymentCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    paymentId: Number(event.payload.paymentId),
    correlationId: event.correlationId,
    causationId: event.eventId
  }
}

export function toRejectReservationCommand(
  event: InventoryRejectedEvent | PaymentFailedEvent,
): RejectReservationCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    reason: event.payload.reason,
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}