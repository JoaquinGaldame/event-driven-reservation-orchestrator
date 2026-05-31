import type { CompleteReservationPaymentCommand } from "../commands/complete-reservation-payment.command.js";
import type { ReservationRepository } from "../ports/reservation.repository.js";

export class CompleteReservationPaymentHandler {
  constructor(
    private readonly reservationRepository: ReservationRepository
  ) {}

  async handle(command: CompleteReservationPaymentCommand): Promise<void> {
    await this.reservationRepository.completeReservationPayment(command);
  }
}