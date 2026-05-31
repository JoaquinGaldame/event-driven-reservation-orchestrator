import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";

import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
  PaymentCapturedEvent,
  PaymentFailedEvent
} from "@reservation/contracts";

import { config } from "../../config.js";

import { RequestReservationHandler } from "../../application/handlers/request-reservation.handler.js";
import { ConfirmReservationHandler } from "../../application/handlers/confirm-reservation.handler.js";
import { RejectReservationHandler } from "../../application/handlers/reject-reservation.handler.js";
import { CompleteReservationPaymentHandler } from "../../application/handlers/complete-reservation-payment.handler.js";

import { DrizzleReservationRepository } from "../../infrastructure/db/drizzle-reservation.repository.js";
import { KafkaEventPublisher } from "../../infrastructure/publishers/kafka-event.publisher.js";

import {
  toConfirmReservationCommand,
  toCompleteReservationPaymentCommand,
  toRejectReservationCommand,
  toRequestReservationCommand,
} from "./reservation-message-router.js";

export async function startReservationConsumers(): Promise<void> {
  const eventBus = new KafkaEventBus({
    clientId: config.kafka.clientId,
    brokers: [config.kafka.broker],
    groupId: config.kafka.groupId,
    serviceName: config.kafka.service
  });

  const reservationRepository = new DrizzleReservationRepository();
  const eventPublisher = new KafkaEventPublisher(eventBus);

  const requestReservationHandler = new RequestReservationHandler(
    reservationRepository,
    eventPublisher,
  );

  const confirmReservationHandler = new ConfirmReservationHandler(
    reservationRepository,
    eventPublisher
  );

  const completeReservationPaymentHandler = new CompleteReservationPaymentHandler(reservationRepository);

  const rejectReservationHandler = new RejectReservationHandler(
    reservationRepository,
  );

  await eventPublisher.flushPendingInventoryLockRequests();

  await eventPublisher.flushPendingPaymentRequests();

  eventBus.subscribe("ReservationRequested", async (event) => {
    const command = toRequestReservationCommand(
      event as ReservationRequestedEvent,
    );

    await requestReservationHandler.handle(command);
  });

  eventBus.subscribe("InventoryLocked", async (event) => {
    const command = toConfirmReservationCommand(event as InventoryLockedEvent);

    await confirmReservationHandler.handle(command);
  });

  eventBus.subscribe("InventoryRejected", async (event) => {
    const command = toRejectReservationCommand(event as InventoryRejectedEvent);

    await rejectReservationHandler.handle(command);
  });

  eventBus.subscribe("PaymentCaptured", async (event) => {
    const command = toCompleteReservationPaymentCommand(event as PaymentCapturedEvent);

    await completeReservationPaymentHandler.handle(command)
  });

  eventBus.subscribe("PaymentFailed", async (event) => {
    const command = toRejectReservationCommand(event as PaymentFailedEvent);

    await rejectReservationHandler.handle(command)
  });


  await eventBus.startConsuming([
    "ReservationRequested",
    "InventoryLocked",
    "InventoryRejected",
    "PaymentCaptured",
    "PaymentFailed"
  ]);

  logger.info("Reservation consumers started", {
    service: config.kafka.service,
  });
}