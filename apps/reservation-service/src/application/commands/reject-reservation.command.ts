export type RejectReservationCommand = {
  reservationId: number;
  reservationCode?: string;
  reason: string;
  correlationId: string;
  causationId: string | null;
};