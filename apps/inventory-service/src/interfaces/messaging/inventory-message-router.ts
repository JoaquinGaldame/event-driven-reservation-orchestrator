import type { InventoryLockRequestedEvent } from "@reservation/contracts";
import type { LockInventoryCommand } from "../../application/commands/lock-inventory.command.js";

export function toLockInventoryCommand( event: InventoryLockRequestedEvent ): LockInventoryCommand {
  return {
    reservationId: Number(event.payload.reservationId),
    propertyId: Number(event.payload.propertyId),
    unitId: Number(event.payload.unitId),
    checkIn: event.payload.checkIn,
    checkOut: event.payload.checkOut,
    correlationId: event.correlationId,
    causationId: event.eventId,
  };
}