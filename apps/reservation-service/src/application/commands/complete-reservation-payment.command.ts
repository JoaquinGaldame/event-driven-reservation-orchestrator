export type CompleteReservationPaymentCommand = {
  reservationId: number;
  paymentId: number;
  correlationId: string;
  causationId: string | null;
}