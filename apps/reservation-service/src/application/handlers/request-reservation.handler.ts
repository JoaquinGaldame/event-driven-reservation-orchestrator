import type {
  ReservationRequestedEvent,
} from "@reservation/contracts";

import type { EventPublisher } from "../ports/event-publisher.js";
import type { ReservationRepository } from "../ports/reservation.repository.js";

export class RequestReservationHandler {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(event: ReservationRequestedEvent): Promise<void> {
    const result =
      await this.reservationRepository.createFromRequestedEvent(event);

    if (result.pendingInventoryLockOutboxEventId === null) {
      return;
    }

    await this.eventPublisher.publishPendingInventoryLockRequest(
      result.pendingInventoryLockOutboxEventId,
    );
  }
}
