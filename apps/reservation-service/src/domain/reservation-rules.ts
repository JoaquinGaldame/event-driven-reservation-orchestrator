import {
  ReservationStatus,
  isTerminalReservationStatus,
} from "./reservation-status.js";

import {
  InvalidReservationDateRangeError,
  InvalidReservationTransitionError,
  ReservationAlreadyFinalizedError,
} from "./reservation.errors.js";

/**
 * Valida que el rango de fechas de una reserva sea consistente.
 *
 * La fecha de salida debe ser posterior a la fecha de entrada y ambas deben
 * poder interpretarse como fechas validas de dominio.
 *
 * @param checkIn Fecha de ingreso en formato ISO de fecha.
 * @param checkOut Fecha de salida en formato ISO de fecha.
 * @throws InvalidReservationDateRangeError Si el rango es invalido.
 */
export function assertValidReservationDateRange( checkIn: string, checkOut: string ): void {
  const checkInDate = new Date(`${checkIn}T00:00:00.000Z`);
  const checkOutDate = new Date(`${checkOut}T00:00:00.000Z`);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new InvalidReservationDateRangeError(checkIn, checkOut);
  }

  if (checkOutDate <= checkInDate) {
    throw new InvalidReservationDateRangeError(checkIn, checkOut);
  }
}


/**
 * Valida si una transicion de estado es permitida para una reserva.
 *
 * La regla protege al dominio frente a cambios inconsistentes, evita avanzar
 * desde estados terminales y centraliza la matriz oficial de transiciones.
 *
 * @param currentStatus Estado actual persistido o reconstruido del agregado.
 * @param nextStatus Estado objetivo que se desea aplicar.
 * @throws ReservationAlreadyFinalizedError Si la reserva ya esta finalizada.
 * @throws InvalidReservationTransitionError Si la transicion no esta permitida.
 */
export function assertCanTransitionReservationStatus( currentStatus: ReservationStatus, nextStatus: ReservationStatus ): void {
  if (currentStatus === nextStatus) {
    return;
  }

  if (isTerminalReservationStatus(currentStatus)) {
    throw new ReservationAlreadyFinalizedError(currentStatus);
  }

  const allowedTransitions: Record<ReservationStatus, ReservationStatus[]> = {
    [ReservationStatus.Pending]: [
      ReservationStatus.InventoryLocked,
      ReservationStatus.Rejected,
      ReservationStatus.Cancelled,
    ],
    [ReservationStatus.InventoryLocked]: [
      ReservationStatus.PaymentRequired,
      ReservationStatus.Confirmed,
      ReservationStatus.Cancelled,
    ],
    [ReservationStatus.PaymentRequired]: [
      ReservationStatus.Confirmed,
      ReservationStatus.Rejected,
      ReservationStatus.Cancelled,
    ],
    [ReservationStatus.Confirmed]: [],
    [ReservationStatus.Rejected]: [],
    [ReservationStatus.Cancelled]: [],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new InvalidReservationTransitionError(currentStatus, nextStatus);
  }
}
