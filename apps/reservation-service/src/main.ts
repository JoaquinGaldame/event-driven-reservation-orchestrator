import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type { InventoryLockedEvent, InventoryLockRequestedEvent, InventoryRejectedEvent, ReservationRequestedEvent } from "@reservation/contracts";

const eventBus = new KafkaEventBus({
  clientId: "reservation-service",
  brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
  groupId: "reservation-service"
});

eventBus.subscribe<ReservationRequestedEvent>(
  "ReservationRequested",
  async (event) => {
    logger.info("ReservationRequested received", {
      service: "reservation-service",
      reservationId: event.payload.reservationId,
      propertyId: event.payload.propertyId,
      unitId: event.payload.unitId,
      channel: event.payload.channel,
      checkIn: event.payload.checkIn,
      checkOut: event.payload.checkOut,
      correlationId: event.correlationId
    });

    const inventoryLockRequested: InventoryLockRequestedEvent = {
      eventId: crypto.randomUUID(),
      eventType: "InventoryLockRequested",
      occurredAt: new Date().toISOString(),
      correlationId: event.correlationId,
      causationId: event.eventId,
      payload: {
        reservationId: event.payload.reservationId,
        propertyId: event.payload.propertyId,
        unitId: event.payload.unitId,
        checkIn: event.payload.checkIn,
        checkOut: event.payload.checkOut
      }
    };

    await eventBus.publish(inventoryLockRequested);
  }
);

eventBus.subscribe<InventoryLockedEvent>("InventoryLocked", async (event) => {
  logger.info("InventoryLocked received. Reservation can be confirmed.", {
    service: "reservation-service",
    reservationId: event.payload.reservationId,
    unitId: event.payload.unitId,
    correlationId: event.correlationId
  });
});

eventBus.subscribe<InventoryRejectedEvent>("InventoryRejected", async (event) => {
  logger.warn("InventoryRejected received. Reservation must be rejected.", {
    service: "reservation-service",
    reservationId: event.payload.reservationId,
    unitId: event.payload.unitId,
    reason: event.payload.reason,
    correlationId: event.correlationId
  });
});

await eventBus.startConsuming([
  "ReservationRequested",
  "InventoryLocked",
  "InventoryRejected"
]);

logger.info("Reservation service started", {
  service: "reservation-service"
});