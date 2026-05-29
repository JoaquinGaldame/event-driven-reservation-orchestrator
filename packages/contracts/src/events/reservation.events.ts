import type { EventEnvelope } from "../shared/event-envelope.js";
import { ChannelCode } from "../shared/channels.js";

export type ReservationRequestedEvent = EventEnvelope<
  "ReservationRequested",
  {
    reservationId: string;
    propertyId: string;
    unitId: string;
    guestId: string;
    channelCode: ChannelCode;
    checkIn: string;
    checkOut: string;
    idempotencyKey: string;
  }
>;

export type ReservationRejectedEvent =
  EventEnvelope<
    "ReservationRejected",
    {
      reservationId: string;
      reason: string;
    }
  >;

export type ReservationConfirmedEvent =
  EventEnvelope<
    "ReservationConfirmed",
    {
      reservationId: string;
      paymentId: string;
    }
  >;


export type ReservationEvent = 
 | ReservationRequestedEvent
 | ReservationRejectedEvent
 | ReservationConfirmedEvent;