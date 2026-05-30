import type { ReservationRequestedEvent } from "@reservation/contracts";

export interface ReservationEventPublisher {
  publishReservationRequested(event: ReservationRequestedEvent): Promise<void>;
}