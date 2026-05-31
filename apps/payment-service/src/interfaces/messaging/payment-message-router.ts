import type { PaymentRequestedEvent } from "@reservation/contracts";
import { ProcessPaymentCommand } from "../../application/commands/process-payment.command.js";


export function toProcessPaymentCommand( event: PaymentRequestedEvent ): ProcessPaymentCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    guestId: Number(event.payload.guestId),
    currencyCode: event.payload.currencyCode,
    amount: event.payload.amount,
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}