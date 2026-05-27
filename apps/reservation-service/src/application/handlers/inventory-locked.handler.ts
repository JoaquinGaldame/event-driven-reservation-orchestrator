import type { InventoryLockedEvent } from "@reservation/contracts";
import type { ReservationRepository } from "../ports/reservation.repository.js";

export class InventoryLockedHandler {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async handle(event: InventoryLockedEvent): Promise<void> {
    await this.reservationRepository.markInventoryLocked(event);
  }
}