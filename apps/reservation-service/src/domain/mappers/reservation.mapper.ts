import { ReservationStatus } from "../reservation-status.js";
import { Reservation } from "../reservation.entity.js";



export type ReservationPersistenceModel = {
  id: number;
  code: string;
  propertyId: number;
  unitId: number;
  guestId: number | null;
  reservationNumber: string;
  channelId: number;
  currencyId: number;
  checkIn: string;
  checkOut: string;
  statusCode: ReservationStatus;
  totalAmount: string;
  rejectionReason: string | null;
  idempotencyKey: string;
  correlationId: string;
};

export class ReservationMapper {
  static toDomain(
    persistence: ReservationPersistenceModel,
  ): Reservation {
    return Reservation.restore({
      id: persistence.id,
      code: persistence.code,
      propertyId: persistence.propertyId,
      unitId: persistence.unitId,
      guestId: persistence.guestId,
      reservationNumber: persistence.reservationNumber,

      channelId: persistence.channelId,
      currencyId: persistence.currencyId,

      checkIn: persistence.checkIn,
      checkOut: persistence.checkOut,

      status: persistence.statusCode,

      totalAmount: persistence.totalAmount,
      rejectionReason: persistence.rejectionReason,

      idempotencyKey: persistence.idempotencyKey,
      correlationId: persistence.correlationId,
    });
  }
}