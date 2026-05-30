import Fastify from "fastify";
import { config } from "../../config.js";
import { KafkaEventBus } from "@reservation/event-bus";
import { healthController } from "./controllers/health.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { meController } from "./controllers/me.controller.js";
import { channelReservationsController } from "./controllers/channel-reservations.controller.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { JwtTokenService } from "../../infrastructure/security/jwt-token.service.js";
import { KafkaReservationEventPublisher } from "../../infrastructure/publishers/kafka-reservation-event.publisher.js";
import { SubmitReservationHandler } from "../../application/handlers/submit-reservation.handler.js";

export async function buildServer() {
  const server = Fastify({ logger: true });

  registerErrorHandler(server);

  const tokenService = new JwtTokenService();

  const eventBus = new KafkaEventBus({
    clientId: config.kafka.clientId,
    groupId: config.kafka.groupId,
    serviceName: config.kafka.service,
    brokers: [config.kafka.broker],
  });
  const reservationEventPublisher = new KafkaReservationEventPublisher(eventBus);
  const submitReservationHandler = new SubmitReservationHandler(
    reservationEventPublisher,
  );

  server.register(healthController, { prefix: "/health" });
  server.register(authController, { prefix: "/auth" });

  server.register(async (app) => {
    await meController(app, { tokenService });
  }, { prefix: "/auth" });

  server.register(async (app) => {
    await channelReservationsController(app, { submitReservationHandler });
  }, { prefix: "/channels" });

  return server;
}