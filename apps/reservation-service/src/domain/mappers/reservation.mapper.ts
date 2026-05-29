import { ReservationStatus } from "../reservation-status.js";
import { Reservation } from "../reservation.entity.js";

/**
 * Proyeccion del modelo persistido necesaria para reconstruir una reserva
 * de dominio desde infraestructura.
 *
 * Este tipo desacopla al mapper de los detalles concretos del ORM y define
 * explicitamente que campos son requeridos por el agregado.
 */
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

/**
 * Mapper entre la representacion persistida de una reserva y su modelo
 * de dominio.
 *
 * Su responsabilidad es traducir datos tecnicos leidos desde base a una
 * entidad `Reservation` valida, lista para que el dominio aplique reglas
 * y transiciones.
 */
export class ReservationMapper {
  /**
   * Reconstruye una entidad de dominio `Reservation` a partir de un modelo
   * de persistencia previamente cargado por infraestructura.
   *
   * @param persistence Datos persistidos normalizados para el agregado.
   * @returns Instancia de dominio completamente restaurada.
   */
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
