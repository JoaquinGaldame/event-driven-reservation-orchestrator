import Fastify from "fastify";
import { healthController } from "./controllers/health.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { meController } from "./controllers/me.controller.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { JwtTokenService } from "../../infrastructure/security/jwt-token.service.js";

export async function buildServer() {
  const server = Fastify({
    logger: true,
  });

  registerErrorHandler(server);

  const tokenService = new JwtTokenService();

  server.register(healthController, { prefix: "/health" });
  server.register(authController, { prefix: "/auth" });
  server.register(meController, { prefix: "/auth", tokenService });

  return server;
}