import type { ReservationRequestedEvent } from "@reservation/contracts";
import type { SubmitReservationCommand } from "../commands/submit-reservation.command.js";
import type { SubmitReservationResultDto } from "../dto/submit-reservation-result.dto.js";
import { ReservationEventPublisher } from "../ports/reservation-event.publisher.js";
import { validateReservationRequestDates } from "../../domain/reservation-request-rules.js";
import { ApplicationError } from "../errors/application.error.js";

export class SubmitReservationHandler {
  constructor(
    private readonly reservationEventPublisher: ReservationEventPublisher,
  ) {}

  async execute(
    command: SubmitReservationCommand,
  ): Promise<SubmitReservationResultDto> {
    if (!command.actorContext) {
      throw new ApplicationError("Missing actor context", "MISSING_ACTOR_CONTEXT", 401);
    }

    validateReservationRequestDates(command.checkIn, command.checkOut);

    const reservationId = crypto.randomUUID();
    const eventId = crypto.randomUUID();
    const correlationId = crypto.randomUUID();

    const event: ReservationRequestedEvent = {
      eventId,
      eventType: "ReservationRequested",
      occurredAt: new Date().toISOString(),
      correlationId,
      payload: {
        reservationId,
        propertyId: command.propertyId,
        unitId: command.unitId,
        guestId: command.guestId,
        channelCode: command.channelCode,
        currencyCode: command.currencyCode,
        checkIn: command.checkIn,
        checkOut: command.checkOut,
        idempotencyKey: command.idempotencyKey,
      },
    };

    await this.reservationEventPublisher.publishReservationRequested(event);

    return {
      status: "accepted",
      reservationId,
      eventId,
      correlationId,
    };
  }
}