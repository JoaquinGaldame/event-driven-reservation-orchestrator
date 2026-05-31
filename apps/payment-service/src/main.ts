import { logger } from "@reservation/logger";
import { config } from "./config.js";
import { startPaymentConsumers } from "./interfaces/messaging/payment-events.consumer.js";

try {
  logger.info("Starting payment service", {
    service: "payment-service",
    kafkaBroker: config.kafka.broker,
    kafkaClientId: config.kafka.clientId,
    kafkaGroupId: config.kafka.groupId,
    outboxBatchSize: config.outbox.batchSize,
  });

  await startPaymentConsumers();

  logger.info("Payment service started", {
      service: "payment-service",
  });
} catch (error) {
  logger.error("Payment service failed to start", {
    service: "payment-service",
    error,
  });

  process.exit(1);
}
