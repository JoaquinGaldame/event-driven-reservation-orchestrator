export type ConfirmReservationCommand = {
  reservationId: number;
  reservationCode?: string;
  channelCode?: string;
  correlationId: string;
  causationId: string | null;
};