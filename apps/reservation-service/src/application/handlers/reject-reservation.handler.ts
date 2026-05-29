import type { RejectReservationCommand } from "../commands/reject-reservation.command.js";
import type { ReservationRepository } from "../ports/reservation.repository.js";

/**
 * Caso de uso encargado de rechazar una reserva cuando el inventario no puede
 * bloquear la unidad solicitada.
 *
 * Su rol es mantener la aplicacion desacoplada del origen del mensaje y
 * delegar en el repository la aplicacion efectiva de la transicion.
 */
export class RejectReservationHandler {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  /**
   * Ejecuta la transicion de la reserva hacia `REJECTED`, incluyendo el motivo
   * funcional informado por el flujo de inventario.
   *
   * @param command Datos internos derivados de `InventoryRejected`.
   */
  async handle(command: RejectReservationCommand): Promise<void> {
    await this.reservationRepository.rejectReservation(command);
  }
}
