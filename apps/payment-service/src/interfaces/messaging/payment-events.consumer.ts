import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type { PaymentRequestedEvent } from "@reservation/contracts";

import { config } from "../../config.js";
import { ProcessPaymentHandler } from "../../application/handlers/process-payment.handler.js";
import { DrizzlePaymentRepository } from "../../infrastructure/db/drizzle-payment.repository.js"
import { KafkaEventPublisher } from "../../infrastructure/publishers/kafka-event.publisher.js";
import { toProcessPaymentCommand } from "./payment-message-router.js";


export async function startPaymentConsumers(): Promise<void> {
  const eventBus = new KafkaEventBus({
    clientId: config.kafka.clientId,
    brokers: [config.kafka.broker],
    groupId: config.kafka.groupId,
    serviceName: config.kafka.service,
  });

  const paymentRepository = new DrizzlePaymentRepository();
  const eventPublisher = new KafkaEventPublisher(eventBus);
  const processPaymentHandler = new ProcessPaymentHandler(
    paymentRepository,
    eventPublisher,
  );

  await eventPublisher.flushPendingPaymentResultEvents();

  eventBus.subscribe("PaymentRequested", async (event) => {
    const command = toProcessPaymentCommand(event as PaymentRequestedEvent);
    await processPaymentHandler.handle(command);
  });

  await eventBus.startConsuming(["PaymentRequested"]);

  logger.info("Payment consumers started", {
    service: config.kafka.service,
  });
}