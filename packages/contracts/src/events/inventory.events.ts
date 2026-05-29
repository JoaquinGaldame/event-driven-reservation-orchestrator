import type { EventEnvelope } from "../shared/event-envelope.js";

export type InventoryLockRequestedEvent = EventEnvelope<
  "InventoryLockRequested",
  {
    reservationId: string;
    propertyId: string;
    unitId: string;
    checkIn: string;
    checkOut: string;
  }
>;

export type InventoryLockedEvent = EventEnvelope<
  "InventoryLocked",
  {
    reservationId: string;
    propertyId: string;
    unitId: string;
    checkIn: string;
    checkOut: string;
  }
>;

export type InventoryRejectedEvent = EventEnvelope<
  "InventoryRejected",
  {
    reservationId: string;
    propertyId: string;
    unitId: string;
    checkIn: string;
    checkOut: string;
    reason:
    | "UNIT_NOT_AVAILABLE"
    | "UNIT_BLOCKED"
    | "MAINTENANCE"
    | "OWNER_BLOCK";
  }
>;

export type InventoryEvent =
  | InventoryLockRequestedEvent
  | InventoryLockedEvent
  | InventoryRejectedEvent;