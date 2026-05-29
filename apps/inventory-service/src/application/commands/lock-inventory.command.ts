export type LockInventoryCommand = {
  reservationId: number;
  propertyId: number;
  unitId: number;
  channelCode: string;
  checkIn: string;
  checkOut: string;
  correlationId: string;
  causationId: string;
};