import { logger } from "@reservation/logger";
import { config } from "./config.js";
import { startInventoryConsumers } from "./interfaces/messaging/inventory-events.consumer.js";


try {
  logger.info("Starting inventory service", {
    service: "inventory-service",
    kafkaBroker: config.kafka.broker,
    kafkaClientId: config.kafka.clientId,
    kafkaGroupId: config.kafka.groupId,
    outboxBatchSize: config.outbox.batchSize
  });

  await startInventoryConsumers();

  logger.info("Inventory service started", {
    service: "inventory-service",
  });

} catch (error) {
  logger.error("Inventory service failed to start", {
    service: "inventory-service",
    error,
  });

  process.exit(1);
}