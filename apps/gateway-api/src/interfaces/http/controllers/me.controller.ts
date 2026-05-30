import type { FastifyInstance } from "fastify";
import type { TokenService } from "../../../application/ports/token.service.js";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

type MeControllerDependencies = {
  tokenService: TokenService;
};

export async function meController(
  server: FastifyInstance,
  { tokenService }: MeControllerDependencies,
) {
  const authMiddleware = createAuthMiddleware(tokenService);

  server.get(
    "/me",
    {
      preHandler: [authMiddleware],
    },
    async (request) => {
      return {
        actor: request.actor,
      };
    },
  );
}