export type LockInventoryCommand = {
  reservationId: number;
  propertyId: number;
  unitId: number;
  checkIn: string;
  checkOut: string;
  correlationId: string;
  causationId: string;
};