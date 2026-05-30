export type SubmitReservationResultDto = {
  status: "accepted";
  reservationId: string;
  eventId: string;
  correlationId: string;
};