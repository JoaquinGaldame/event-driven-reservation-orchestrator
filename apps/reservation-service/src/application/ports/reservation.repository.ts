import type { RequestReservationCommand } from "../../application/commands/request-reservation.command.js";
import type { ConfirmReservationCommand } from "../../application/commands/confirm-reservation.command.js";
import type { RejectReservationCommand } from "../../application/commands/reject-reservation.command.js";

/**
 * Proyeccion minima de una reserva creada o recuperada por idempotencia.
 *
 * Este tipo expone solo los datos que la capa de aplicacion necesita
 * inmediatamente despues del alta, evitando filtrar detalles internos
 * de persistencia que no forman parte del caso de uso.
 */
export type CreatedReservation = {
  id: number;
  code: string;
  propertyId: number;
  unitId: number;
  checkIn: string;
  checkOut: string;
};

/**
 * Resultado del caso de uso de creacion de reserva.
 *
 * Incluye la reserva persistida y, si corresponde, la referencia tecnica
 * al evento de outbox que debe publicarse para continuar el flujo con
 * inventory-service.
 */
export type CreateReservationResult = {
  reservation: CreatedReservation;
  pendingInventoryLockOutboxEventId: number | null;
};

/**
 * Puerto de salida para persistencia y reconstruccion del estado de reservas.
 *
 * La capa de aplicacion utiliza este contrato para ejecutar sus casos de uso
 * sin depender de Drizzle, PostgreSQL ni de detalles del modelo fisico.
 */
export interface ReservationRepository {
  /**
   * Crea una reserva a partir del command interno `RequestReservationCommand`.
   *
   * La implementacion debe:
   * - resolver referencias necesarias del modelo normalizado
   * - validar idempotencia
   * - persistir la reserva
   * - crear, en la misma transaccion, el outbox `InventoryLockRequested`
   *
   * Si el command ya fue procesado previamente, puede devolver la reserva
   * existente junto con un outbox pendiente aun no publicado.
   *
   * @param command Datos normalizados del caso de uso de solicitud de reserva.
   * @returns Resultado de persistencia con la reserva creada y el outbox pendiente.
   */
  createFromRequestCommand(command: RequestReservationCommand ): Promise<CreateReservationResult>;

  /**
   * Aplica la transicion derivada de un `InventoryLocked`.
   *
   * La implementacion debe cargar la reserva actual, reconstruir su estado
   * de dominio y persistir la transicion valida hacia `INVENTORY_LOCKED`,
   * respetando idempotencia y controlando cambios concurrentes.
   *
   * @param command Command interno generado a partir del evento `InventoryLocked`.
   */
  confirmReservation(command: ConfirmReservationCommand): Promise<void>;

  /**
   * Aplica la transicion derivada de un `InventoryRejected`.
   *
   * La implementacion debe mover la reserva a `REJECTED`, almacenar el motivo
   * de rechazo y garantizar que la transicion respete las reglas del dominio
   * y el estado persistido actual.
   *
   * @param command Command interno generado a partir del evento `InventoryRejected`.
   */
  rejectReservation(command: RejectReservationCommand): Promise<void>;
}
