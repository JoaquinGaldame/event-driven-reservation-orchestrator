import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
} from "@reservation/contracts";

import type { RequestReservationCommand } from "../../application/commands/request-reservation.command.js";
import type { ConfirmReservationCommand } from "../../application/commands/confirm-reservation.command.js";
import type { RejectReservationCommand } from "../../application/commands/reject-reservation.command.js";

export function toRequestReservationCommand(
  event: ReservationRequestedEvent,
): RequestReservationCommand {
  return {
    reservationCode: event.payload.reservationId,
    channelCode: event.payload.channel,
    propertyId: Number(event.payload.propertyId),
    unitId: Number(event.payload.unitId),
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
    channelCode: event.payload.channelCode,
    causationId: event.eventId,
  };
}

export function toRejectReservationCommand(
  event: InventoryRejectedEvent,
): RejectReservationCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    reason: event.payload.reason,
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}