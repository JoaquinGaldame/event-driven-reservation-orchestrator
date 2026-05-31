import type { ReservationRepository } from "../ports/reservation.repository.js";
import { ConfirmReservationCommand } from "../commands/confirm-reservation.command.js";
import { EventPublisher } from "../ports/event-publisher.js";

/**
 * Caso de uso encargado de aplicar la confirmacion de lock de inventario
 * sobre una reserva existente.
 *
 * Este handler no conoce eventos Kafka ni detalles de persistencia;
 * simplemente orquesta la ejecucion del command interno correspondiente.
 */
export class ConfirmReservationHandler {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Ejecuta la transicion de la reserva hacia `INVENTORY_LOCKED`.
   *
   * La validacion de reglas y la persistencia concreta se delegan al dominio
   * y al repository respectivamente.
   *
   * @param command Datos internos derivados de `InventoryLocked`.
   */
  async handle(command: ConfirmReservationCommand): Promise<void> {
    const result = await this.reservationRepository.confirmInventory(command);

    if(!result.pendingPaymentRequestOutboxEventId){
      return;
    }

    await this.eventPublisher.publishPendingPaymentRequest(
      result.pendingPaymentRequestOutboxEventId,
    );
  }
}
