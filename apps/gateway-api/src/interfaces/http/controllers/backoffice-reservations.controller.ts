import type { FastifyInstance } from "fastify";
import type { SubmitReservationHandler } from "../../../application/handlers/submit-reservation.handler.js";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/require-role.middleware.js";
import { BackofficeReservationSchema } from "../schemas/backoffice-reservation.schema.js";
import type { TokenService } from "../../../application/ports/token.service.js";

type BackofficeReservationsControllerDependencies = {
  submitReservationHandler: SubmitReservationHandler;
  tokenService: TokenService;
};

export async function backofficeReservationsController(
  server: FastifyInstance,
  {
    submitReservationHandler,
    tokenService,
  }: BackofficeReservationsControllerDependencies,
) {
  const authMiddleware = createAuthMiddleware(tokenService);

  server.post(
    "/reservations",
    {
      preHandler: [authMiddleware, requireRole("ADMIN")],
    },
    async (request, reply) => {
      const parseResult = BackofficeReservationSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: {
            code: "INVALID_BACKOFFICE_RESERVATION_REQUEST",
            message: "Invalid backoffice reservation request",
            details: parseResult.error.flatten(),
          },
        });
      }

      if (!request.actor) {
        return reply.status(401).send({
          error: {
            code: "UNAUTHENTICATED",
            message: "Unauthenticated",
          },
        });
      }

      const input = parseResult.data;

      const result = await submitReservationHandler.execute({
        propertyId: input.propertyId,
        unitId: input.unitId,
        guestId: input.guestId,
        channelCode: "ADMIN",
        currencyCode: input.currencyCode,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        idempotencyKey: input.idempotencyKey,
        actorContext: request.actor,
      });

      return reply.status(202).send(result);
    },
  );
}