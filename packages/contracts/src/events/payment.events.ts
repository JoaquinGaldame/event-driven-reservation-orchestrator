import { EventEnvelope } from "../shared/event-envelope.js";

export type PaymentRequestedEvent =
  EventEnvelope<
    "PaymentRequested",
    {
      reservationId: string;
      guestId: string;
      currencyCode: string;
      amount: number;
    }
  >;


export type PaymentAuthorizedEvent =
  EventEnvelope<
    "PaymentAuthorized",
    {
      paymentId: string;
      reservationId: string;
      amount: number;
    }
  >;


export type PaymentFailedEvent =
  EventEnvelope<
    "PaymentFailed",
    {
      paymentId: string;
      reservationId: string;
      reason: string;
    }
  >;

export type PaymentCapturedEvent =
  EventEnvelope<
    "PaymentCaptured",
    {
      paymentId: string;
      reservationId: string;
    }
  >;

export type PaymentRefundedEvent =
  EventEnvelope<
    "PaymentRefunded",
    {
      paymentId: string;
      reservationId: string;
      amount: number;
    }
  >;


export type PaymentEvent = 
 | PaymentRequestedEvent
 | PaymentAuthorizedEvent
 | PaymentFailedEvent
 | PaymentCapturedEvent
 | PaymentRefundedEvent;