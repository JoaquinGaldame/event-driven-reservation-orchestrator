export type ReservationChannel = "AIRBNB" | "BOOKING" | "DIRECT" | "ADMIN";

export type ReservationRequestedEvent = {
  eventId: string;
  eventType: "ReservationRequested";
  occurredAt: string;
  correlationId: string;
  causationId?: string;

  payload: {
    reservationId: string;
    propertyId: string;
    unitId: string;
    channel: ReservationChannel;
    guestName: string;
    checkIn: string;
    checkOut: string;
    idempotencyKey: string;
  };
};

export type ReservationEvent = ReservationRequestedEvent;