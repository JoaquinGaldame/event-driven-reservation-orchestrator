import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { EventBus } from "@reservation/event-bus";
import type { ReservationRequestedEvent } from "@reservation/contracts";

const ReservationRequestSchema = z.object({
  propertyId: z.string().min(1),
  unitId: z.string().min(1),
  guestName: z.string().min(1),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  idempotencyKey: z.string().min(1)
});

type RegisterReservationRoutesDependencies = {
  eventBus: EventBus;
};

export function registerReservationRoutes(
  app: FastifyInstance,
  { eventBus }: RegisterReservationRoutesDependencies
) {
  app.post("/channels/airbnb/reservations", async (request, reply) => {
    const parseResult = ReservationRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "INVALID_RESERVATION_REQUEST",
        details: parseResult.error.flatten()
      });
    }

    const input = parseResult.data;

    const event: ReservationRequestedEvent = {
      eventId: crypto.randomUUID(),
      eventType: "ReservationRequested",
      occurredAt: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
      payload: {
        reservationId: crypto.randomUUID(),
        propertyId: input.propertyId,
        unitId: input.unitId,
        channel: "AIRBNB",
        guestName: input.guestName,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        idempotencyKey: input.idempotencyKey
      }
    };

    await eventBus.publish(event);

    return reply.status(202).send({
      status: "accepted",
      reservationId: event.payload.reservationId,
      eventId: event.eventId,
      correlationId: event.correlationId
    });
  });
}