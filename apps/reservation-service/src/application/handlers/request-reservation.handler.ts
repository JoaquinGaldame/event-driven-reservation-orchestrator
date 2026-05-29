import type { EventPublisher } from "../ports/event-publisher.js";
import type { ReservationRepository } from "../ports/reservation.repository.js";
import type { RequestReservationCommand } from "../commands/request-reservation.command.js";

/**
 * Caso de uso encargado de registrar una nueva solicitud de reserva.
 *
 * Su responsabilidad es coordinar la persistencia inicial de la reserva y,
 * si el alta genero un evento pendiente en outbox, solicitar su publicacion
 * para continuar el flujo con inventory-service.
 */
export class RequestReservationHandler {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Ejecuta el alta de la reserva a partir de un command interno.
   *
   * Si el repository devuelve un outbox pendiente, este handler delega
   * inmediatamente su publicacion al puerto `EventPublisher`.
   *
   * @param command Datos del caso de uso de solicitud de reserva.
   */
  async handle(command: RequestReservationCommand): Promise<void> {
    const result = await this.reservationRepository.createFromRequestCommand(command);

    if (!result.pendingInventoryLockOutboxEventId) {
      return;
    }

    await this.eventPublisher.publishPendingInventoryLockRequest(
      result.pendingInventoryLockOutboxEventId,
    );
  }
}
