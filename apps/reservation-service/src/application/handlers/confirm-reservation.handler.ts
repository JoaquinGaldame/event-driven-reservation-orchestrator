import type { ReservationRepository } from "../ports/reservation.repository.js";
import { ConfirmReservationCommand } from "../commands/confirm-reservation.command.js";

/**
 * Caso de uso encargado de aplicar la confirmacion de lock de inventario
 * sobre una reserva existente.
 *
 * Este handler no conoce eventos Kafka ni detalles de persistencia;
 * simplemente orquesta la ejecucion del command interno correspondiente.
 */
export class ConfirmReservationHandler {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  /**
   * Ejecuta la transicion de la reserva hacia `INVENTORY_LOCKED`.
   *
   * La validacion de reglas y la persistencia concreta se delegan al dominio
   * y al repository respectivamente.
   *
   * @param command Datos internos derivados de `InventoryLocked`.
   */
  async handle(command: ConfirmReservationCommand): Promise<void> {
    await this.reservationRepository.confirmReservation(command);
  }
}
