import { logger } from "@reservation/logger";
import { config } from "./config.js";
import { startReservationConsumers } from "./infrastructure/consumers/reservation-events.consumer.js";

try {
  logger.info("Starting reservation service", {
    service: "reservation-service",
    kafkaBroker: config.kafka.broker,
    kafkaClientId: config.kafka.clientId,
    kafkaGroupId: config.kafka.groupId,
    outboxBatchSize: config.outbox.batchSize
  });

  await startReservationConsumers();

  logger.info("Reservation service started", {
    service: "reservation-service",
  });

} catch (error) {
  logger.error("Reservation service failed to start", {
    service: "reservation-service",
    error,
  });

  process.exit(1);
}