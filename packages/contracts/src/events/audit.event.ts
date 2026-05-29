import { ReservationEvent } from "./reservation.events.js";
import { InventoryEvent } from "./inventory.events.js";
import { PaymentEvent } from "./payment.events.js";

export type AuditableEvent =
  | ReservationEvent
  | InventoryEvent
  | PaymentEvent;