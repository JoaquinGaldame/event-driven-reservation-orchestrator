import { InMemoryEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const eventBus = new InMemoryEventBus();

const app = buildApp({
  eventBus
});

try {
  await app.listen({
    port: PORT,
    host: HOST
  });

  logger.info("Gateway API started", {
    service: "gateway-api",
    port: PORT,
    host: HOST
  });
} catch (error) {
  logger.error("Gateway API failed to start", {
    service: "gateway-api",
    error
  });

  process.exit(1);
}