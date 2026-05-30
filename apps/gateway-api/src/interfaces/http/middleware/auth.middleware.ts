import type { FastifyReply, FastifyRequest } from "fastify";
import type { TokenService } from "../../../application/ports/token.service.js";
import type { ActorContext } from "../../../shared/types/actor-context.js";
import { ApplicationError } from "../../../application/errors/application.error.js";

declare module "fastify" {
  interface FastifyRequest {
    actor?: ActorContext;
  }
}

export function createAuthMiddleware(tokenService: TokenService) {
  return async function authMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new ApplicationError(
        "Missing authorization header",
        "MISSING_AUTHORIZATION_HEADER",
        401,
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApplicationError(
        "Invalid authorization header",
        "INVALID_AUTHORIZATION_HEADER",
        401,
      );
    }

    try {
      const payload = await tokenService.verify(token);
      request.actor = {
        actorType: "BACKOFFICE_USER",
        actorId: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
    } catch {
      throw new ApplicationError("Invalid token", "INVALID_TOKEN", 401);
    }
  };
}