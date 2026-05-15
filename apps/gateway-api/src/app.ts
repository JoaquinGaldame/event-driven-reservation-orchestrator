import Fastify from "fastify";
import type { EventBus } from "@reservation/event-bus";
import { registerReservationRoutes } from "./routes/reservations.routes.js";

type BuildAppDependencies = {
  eventBus: EventBus;
};

export function buildApp({ eventBus }: BuildAppDependencies) {
  const app = Fastify({
    logger: false
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "gateway-api"
    };
  });

  registerReservationRoutes(app, {
    eventBus
  });

  return app;
}