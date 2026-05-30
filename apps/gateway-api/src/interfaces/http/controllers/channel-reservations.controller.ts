import type { FastifyInstance } from "fastify";
import type { ChannelCode } from "@reservation/contracts";
import type { SubmitReservationHandler } from "../../../application/handlers/submit-reservation.handler.js";
import { ChannelReservationSchema } from "../schemas/channel-reservation.schema.js";

type ChannelReservationsControllerDependencies = {
  submitReservationHandler: SubmitReservationHandler;
};

const channelCodeByRoute: Record<string, ChannelCode> = {
  airbnb: "AIRBNB",
  booking: "BOOKING",
  vrbo: "VRBO",
  direct: "DIRECT",
};

export async function channelReservationsController(
  server: FastifyInstance,
  { submitReservationHandler }: ChannelReservationsControllerDependencies,
) {
  server.post<{ Params: { channel: string } }>(
    "/:channel/reservations",
    async (request, reply) => {
      const channelCode = channelCodeByRoute[request.params.channel];

      if (!channelCode) {
        return reply.status(404).send({
          error: {
            code: "UNKNOWN_CHANNEL",
            message: "Unknown channel",
          },
        });
      }

      const parseResult = ChannelReservationSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: {
            code: "INVALID_RESERVATION_REQUEST",
            message: "Invalid reservation request",
            details: parseResult.error.flatten(),
          },
        });
      }

      const input = parseResult.data;

      const result = await submitReservationHandler.execute({
        propertyId: input.propertyId,
        unitId: input.unitId,
        guestId: input.guestId,
        channelCode,
        currencyCode: input.currencyCode,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        idempotencyKey: input.idempotencyKey,
        actorContext: {
          actorType: "CHANNEL",
          actorId: channelCode,
          roles: ["CHANNEL"],
        },
      });

      return reply.status(202).send(result);
    },
  );
}