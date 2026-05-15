import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type {
  InventoryLockedEvent,
  InventoryLockRequestedEvent
} from "@reservation/contracts";

const eventBus = new KafkaEventBus({
  clientId: "inventory-service",
  brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
  groupId: "inventory-service"
});

eventBus.subscribe<InventoryLockRequestedEvent>(
  "InventoryLockRequested",
  async (event) => {
    logger.info("InventoryLockRequested received", {
      service: "inventory-service",
      reservationId: event.payload.reservationId,
      propertyId: event.payload.propertyId,
      unitId: event.payload.unitId,
      checkIn: event.payload.checkIn,
      checkOut: event.payload.checkOut,
      correlationId: event.correlationId
    });

    const inventoryLocked: InventoryLockedEvent = {
      eventId: crypto.randomUUID(),
      eventType: "InventoryLocked",
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

    await eventBus.publish(inventoryLocked);
  }
);

await eventBus.startConsuming(["InventoryLockRequested"]);

logger.info("Inventory service started", {
  service: "inventory-service"
});