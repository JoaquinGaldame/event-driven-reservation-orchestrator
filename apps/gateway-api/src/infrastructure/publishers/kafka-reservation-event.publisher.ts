import type { EventBus } from "@reservation/event-bus";
import type { ReservationRequestedEvent } from "@reservation/contracts";
import { ReservationEventPublisher } from "../../application/ports/reservation-event.publisher.js";


export class KafkaReservationEventPublisher implements ReservationEventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  async publishReservationRequested(
    event: ReservationRequestedEvent,
  ): Promise<void> {
    await this.eventBus.publish(event);
  }
}