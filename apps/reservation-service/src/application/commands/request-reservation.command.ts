export type RequestReservationCommand = {
  reservationCode: string;
  channelCode: string;
  propertyId: number;
  unitId: number;
  checkIn: string;
  checkOut: string;
  idempotencyKey: string;
  correlationId: string;
  causationId: string;
};