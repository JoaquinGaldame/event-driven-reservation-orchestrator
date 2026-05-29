import { ReservationStatus } from "./reservation-status.js";
import {
  assertCanTransitionReservationStatus,
  assertValidReservationDateRange,
} from "./reservation-rules.js";

/**
 * Estructura completa del agregado `Reservation` dentro del dominio.
 *
 * Representa el estado necesario para evaluar reglas, transiciones y
 * reconstruccion del agregado desde persistencia.
 */
export type ReservationProps = {
  id?: number;
  code: string;
  propertyId: number;
  unitId: number;
  guestId: number | null;
  channelId: number;
  currencyId: number;
  reservationNumber: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  totalAmount: string;
  rejectionReason?: string | null;
  idempotencyKey: string;
  correlationId: string;
};

/**
 * Entidad de dominio que modela una reserva dentro del orquestador.
 *
 * Su objetivo es encapsular reglas de consistencia y transiciones validas
 * de estado, evitando que el negocio quede distribuido en handlers,
 * repositories o adaptadores externos.
 */
export class Reservation {
  /**
   * Constructor privado para asegurar que toda instancia del agregado
   * se cree o reconstruya pasando por validaciones del dominio.
   */
  private constructor(private readonly props: ReservationProps) {
    assertValidReservationDateRange(props.checkIn, props.checkOut);
  }

  /**
   * Crea una nueva reserva de dominio en su estado inicial `PENDING`.
   *
   * Debe utilizarse al construir el agregado desde un nuevo caso de uso,
   * no desde un registro ya persistido.
   *
   * @param props Datos base de la reserva antes de asignar estado inicial.
   * @returns Nueva instancia valida del agregado.
   */
  static request(props: Omit<ReservationProps, "status" | "rejectionReason">): Reservation {
    return new Reservation({
      ...props,
      status: ReservationStatus.Pending,
      rejectionReason: null,
    });
  }

  /**
   * Reconstruye una reserva ya existente a partir de su estado persistido.
   *
   * Se utiliza cuando la infraestructura lee una fila de base de datos
   * y necesita volver a llevarla al modelo de dominio para aplicar reglas.
   *
   * @param props Estado persistido del agregado.
   * @returns Instancia del agregado lista para operar en dominio.
   */
  static restore(props: ReservationProps): Reservation {
    return new Reservation(props);
  }

  /**
   * Aplica la transicion hacia `INVENTORY_LOCKED`.
   *
   * Esta operacion representa que inventory-service acepto el bloqueo de
   * disponibilidad para la unidad solicitada.
   *
   * @returns Nueva instancia del agregado con estado actualizado.
   */
  confirmInventoryLock(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.InventoryLocked,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.InventoryLocked,
    });
  }

  /**
   * Aplica la transicion hacia `PAYMENT_REQUIRED`.
   *
   * Esta operacion deja preparada la reserva para un flujo posterior
   * de cobro o confirmacion financiera.
   *
   * @returns Nueva instancia del agregado con estado actualizado.
   */
  markPaymentRequired(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.PaymentRequired,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.PaymentRequired,
    });
  }

  /**
   * Aplica la transicion hacia `CONFIRMED`.
   *
   * Debe utilizarse cuando el proceso de reserva ya cumplio las condiciones
   * necesarias para quedar confirmado de forma definitiva.
   *
   * @returns Nueva instancia del agregado con estado confirmado.
   */
  confirm(): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Confirmed,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Confirmed,
      rejectionReason: null,
    });
  }

  /**
   * Aplica la transicion hacia `REJECTED` y registra el motivo funcional
   * del rechazo.
   *
   * @param reason Motivo de negocio asociado al rechazo.
   * @returns Nueva instancia del agregado en estado rechazado.
   */
  reject(reason: string): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Rejected,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Rejected,
      rejectionReason: reason,
    });
  }

  /**
   * Aplica la transicion hacia `CANCELLED`.
   *
   * Permite cancelar la reserva dejando opcionalmente una razon registrada
   * para auditoria funcional o tecnica.
   *
   * @param reason Motivo opcional de cancelacion.
   * @returns Nueva instancia del agregado cancelado.
   */
  cancel(reason?: string): Reservation {
    assertCanTransitionReservationStatus(
      this.props.status,
      ReservationStatus.Cancelled,
    );

    return new Reservation({
      ...this.props,
      status: ReservationStatus.Cancelled,
      rejectionReason: reason ?? null,
    });
  }

  /**
   * Devuelve una copia plana del estado interno del agregado.
   *
   * Es util cuando la infraestructura necesita persistir o inspeccionar
   * el estado completo de la entidad sin exponer la referencia interna.
   */
  toPrimitives(): ReservationProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get reservationNumber(): string {
    return this.props.reservationNumber;
  }

  get status(): ReservationStatus {
    return this.props.status;
  }

  get channelId(): number {
    return this.props.channelId;
  }

  get currencyId(): number {
    return this.props.currencyId;
  }


  get checkIn(): string {
    return this.props.checkIn;
  }

  get checkOut(): string {
    return this.props.checkOut;
  }

  get propertyId(): number {
    return this.props.propertyId;
  }

  get unitId(): number {
    return this.props.unitId;
  }

  get rejectionReason(): string | null | undefined {
    return this.props.rejectionReason;
  }

  get totalAmount(): string {
    return this.props.totalAmount;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get correlationId(): string {
    return this.props.correlationId;
  }
}
