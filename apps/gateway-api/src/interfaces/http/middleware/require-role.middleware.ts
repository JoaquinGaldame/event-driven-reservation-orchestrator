import type { FastifyReply, FastifyRequest } from "fastify";
import { ApplicationError } from "../../../application/errors/application.error.js";

export function requireRole(requiredRole: string) {
  return async function requireRoleMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    if (!request.actor) {
      throw new ApplicationError("Unauthenticated", "UNAUTHENTICATED", 401);
    }

    if (!request.actor.roles.includes(requiredRole)) {
      throw new ApplicationError("Forbidden", "FORBIDDEN", 403);
    }
  };
}