import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type { InventoryLockRequestedEvent } from "@reservation/contracts";

import { config } from "../../config.js";
import { LockInventoryHandler } from "../../application/handlers/lock-inventory.handler.js";
import { DrizzleInventoryLockRepository } from "../../infrastructure/db/drizzle-inventory-lock.repository.js";
import { KafkaEventPublisher } from "../../infrastructure/publishers/kafka-event.publisher.js";
import { toLockInventoryCommand } from "./inventory-message-router.js";

export async function startInventoryConsumers(): Promise<void> {
  const eventBus = new KafkaEventBus({
    clientId: config.kafka.clientId,
    brokers: [config.kafka.broker],
    groupId: config.kafka.groupId,
    serviceName: config.kafka.service,
  });

  const inventoryLockRepository = new DrizzleInventoryLockRepository();
  const eventPublisher = new KafkaEventPublisher(eventBus);
  const lockInventoryHandler = new LockInventoryHandler(
    inventoryLockRepository,
    eventPublisher,
  );

  await eventPublisher.flushPendingInventoryResultEvents();

  eventBus.subscribe("InventoryLockRequested", async (event) => {
    const command = toLockInventoryCommand(event as InventoryLockRequestedEvent);
    await lockInventoryHandler.handle(command);
  });

  await eventBus.startConsuming(["InventoryLockRequested"]);

  logger.info("Inventory consumers started", {
    service: config.kafka.service,
  });
}