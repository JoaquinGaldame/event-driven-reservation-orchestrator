import type { InventoryRejectedEvent } from "@reservation/contracts";
import type { ReservationRepository } from "../ports/reservation.repository.js";

export class InventoryRejectedHandler {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async handle(event: InventoryRejectedEvent): Promise<void> {
    await this.reservationRepository.markInventoryRejected(event);
  }
}