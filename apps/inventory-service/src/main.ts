import { db, inventoryLocks, and, eq, lt, gt } from "@reservation/database";
import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type {
  InventoryLockedEvent,
  InventoryLockRequestedEvent,
  InventoryRejectedEvent
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
      reservationId: event.payload.reservationId,
      unitId: event.payload.unitId
    });

    const requestedCheckIn = new Date(event.payload.checkIn);
    const requestedCheckOut = new Date(event.payload.checkOut);

    const overlappingLocks = await db
      .select()
      .from(inventoryLocks)
      .where(
        and(
          eq(inventoryLocks.unitId, event.payload.unitId),
          lt(inventoryLocks.checkIn, requestedCheckOut),
          gt(inventoryLocks.checkOut, requestedCheckIn)
        )
      );

    if (overlappingLocks.length > 0) {
      const rejectedEvent: InventoryRejectedEvent = {
        eventId: crypto.randomUUID(),
        eventType: "InventoryRejected",
        occurredAt: new Date().toISOString(),
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          reservationId: event.payload.reservationId,
          propertyId: event.payload.propertyId,
          unitId: event.payload.unitId,
          checkIn: event.payload.checkIn,
          checkOut: event.payload.checkOut,
          reason: "UNIT_NOT_AVAILABLE"
        }
      };

      await eventBus.publish(rejectedEvent);

      logger.warn("Inventory rejected due overlap", {
        reservationId: event.payload.reservationId,
        unitId: event.payload.unitId
      });

      return;
    }

    await db.insert(inventoryLocks).values({
      id: crypto.randomUUID(),
      reservationId: event.payload.reservationId,
      propertyId: event.payload.propertyId,
      unitId: event.payload.unitId,
      checkIn: requestedCheckIn,
      checkOut: requestedCheckOut
    });

    const lockedEvent: InventoryLockedEvent = {
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

    await eventBus.publish(lockedEvent);

    logger.info("Inventory locked", {
      reservationId: event.payload.reservationId,
      unitId: event.payload.unitId
    });
  }
);

await eventBus.startConsuming(["InventoryLockRequested"]);

logger.info("Inventory service started");