import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";

import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
} from "@reservation/contracts";

import { config } from "../../config.js";
import { RequestReservationHandler } from "../../application/handlers/request-reservation.handler.js";
import { InventoryLockedHandler } from "../../application/handlers/inventory-locked.handler.js";
import { InventoryRejectedHandler } from "../../application/handlers/inventory-rejected.handler.js";
import { DrizzleReservationRepository } from "../db/drizzle-reservation.repository.js";
import { KafkaEventPublisher } from "../publishers/kafka-event.publisher.js";

export async function startReservationConsumers(): Promise<void> {
  const eventBus = new KafkaEventBus({
    clientId: config.kafka.clientId,
    brokers: [config.kafka.broker],
    groupId: config.kafka.groupId,
  });

  const reservationRepository = new DrizzleReservationRepository();
  const eventPublisher = new KafkaEventPublisher(eventBus);

  const requestReservationHandler = new RequestReservationHandler(
    reservationRepository,
    eventPublisher,
  );

  const inventoryLockedHandler = new InventoryLockedHandler(
    reservationRepository,
  );

  const inventoryRejectedHandler = new InventoryRejectedHandler(
    reservationRepository,
  );

  await eventPublisher.flushPendingInventoryLockRequests();

  eventBus.subscribe("ReservationRequested", async (event) => {
    await requestReservationHandler.handle(event as ReservationRequestedEvent);
  });

  eventBus.subscribe("InventoryLocked", async (event) => {
    await inventoryLockedHandler.handle(event as InventoryLockedEvent);
  });

  eventBus.subscribe("InventoryRejected", async (event) => {
    await inventoryRejectedHandler.handle(event as InventoryRejectedEvent);
  });

  await eventBus.startConsuming([
    "ReservationRequested",
    "InventoryLocked",
    "InventoryRejected",
  ]);

  logger.info("Reservation consumers started", {
    service: "reservation-service",
  });
}
