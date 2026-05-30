import { ApplicationError } from "../application/errors/application.error.js";

export function validateReservationRequestDates(checkIn: string, checkOut: string) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new ApplicationError(
      "Invalid reservation date",
      "INVALID_RESERVATION_DATE",
      400,
    );
  }

  if (checkOutDate <= checkInDate) {
    throw new ApplicationError(
      "checkOut must be after checkIn",
      "INVALID_RESERVATION_DATE_RANGE",
      400,
    );
  }
}