import { db, reservations, eq } from "@reservation/database";
import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type {
  InventoryLockedEvent,
  InventoryLockRequestedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent
} from "@reservation/contracts";

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

    await db
      .insert(reservations)
      .values({
        id: event.payload.reservationId,
        propertyId: event.payload.propertyId,
        unitId: event.payload.unitId,
        channel: event.payload.channel,
        checkIn: new Date(event.payload.checkIn),
        checkOut: new Date(event.payload.checkOut),
        status: "PENDING"
      })
      .onConflictDoNothing();

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
  await db
    .update(reservations)
    .set({
      status: "INVENTORY_LOCKED",
      updatedAt: new Date()
    })
    .where(eq(reservations.id, event.payload.reservationId));

  logger.info("InventoryLocked received. Reservation inventory locked.", {
    service: "reservation-service",
    reservationId: event.payload.reservationId,
    unitId: event.payload.unitId,
    correlationId: event.correlationId
  });
});

eventBus.subscribe<InventoryRejectedEvent>("InventoryRejected", async (event) => {
  await db
    .update(reservations)
    .set({
      status: "REJECTED",
      rejectionReason: event.payload.reason,
      updatedAt: new Date()
    })
    .where(eq(reservations.id, event.payload.reservationId));

  logger.warn("InventoryRejected received. Reservation rejected.", {
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