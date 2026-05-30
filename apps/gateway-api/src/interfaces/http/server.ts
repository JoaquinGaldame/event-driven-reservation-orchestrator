import Fastify from "fastify";
import { healthController } from "./controllers/health.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { registerErrorHandler } from "./middleware/error-handler.js";


export async function buildServer() {
  const server = Fastify({
    logger: true,
  });

  registerErrorHandler(server);

  server.register(healthController, { prefix: "/health" });
  server.register(authController, { prefix: "/auth" });

  return server;
}