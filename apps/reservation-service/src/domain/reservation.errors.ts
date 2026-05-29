import type { ReservationStatus } from "./reservation-status.js";

export class InvalidReservationDateRangeError extends Error {
  constructor(checkIn: string, checkOut: string) {
    super(`Invalid reservation date range: checkIn=${checkIn}, checkOut=${checkOut}`);
    this.name = "InvalidReservationDateRangeError";
  }
}

export class InvalidReservationTransitionError extends Error {
  constructor(from: ReservationStatus, to: ReservationStatus) {
    super(`Invalid reservation status transition: ${from} -> ${to}`);
    this.name = "InvalidReservationTransitionError";
  }
}

export class ReservationAlreadyFinalizedError extends Error {
  constructor(status: ReservationStatus) {
    super(`Reservation is already finalized with status: ${status}`);
    this.name = "ReservationAlreadyFinalizedError";
  }
}