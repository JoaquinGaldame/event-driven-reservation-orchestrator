export type ReservationChannel = "AIRBNB" | "BOOKING" | "VRBO" | "DIRECT" | "ADMIN";

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

export type InventoryLockRequestedEvent = {
  eventId: string;
  eventType: "InventoryLockRequested";
  occurredAt: string;
  correlationId: string;
  causationId: string;

  payload: {
    reservationId: string;
    propertyId: string;
    unitId: string;
    channelCode: string;
    checkIn: string;
    checkOut: string;
  };
};

export type InventoryLockedEvent = {
  eventId: string;
  eventType: "InventoryLocked";
  occurredAt: string;
  correlationId: string;
  causationId: string;

  payload: {
    reservationId: string;
    propertyId: string;
    unitId: string;
    channelCode: string;
    checkIn: string;
    checkOut: string;
  };
};

export type InventoryRejectedEvent = {
  eventId: string;
  eventType: "InventoryRejected";
  occurredAt: string;
  correlationId: string;
  causationId: string;

  payload: {
    reservationId: string;
    propertyId: string;
    unitId: string;
    checkIn: string;
    checkOut: string;
    reason: "UNIT_NOT_AVAILABLE";
  };
};

export type ReservationEvent =
  | ReservationRequestedEvent
  | InventoryLockRequestedEvent
  | InventoryLockedEvent
  | InventoryRejectedEvent;