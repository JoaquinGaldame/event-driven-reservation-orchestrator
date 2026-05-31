/**
 * Puerto de salida para la publicacion de eventos derivados del flujo de reservas.
 *
 * La capa de aplicacion depende de este contrato para solicitar la emision
 * de eventos ya persistidos en outbox, sin conocer el mecanismo concreto
 * de transporte o entrega.
 */
export interface EventPublisher {
  /**
   * Reprocesa eventos de tipo `InventoryLockRequested` que hayan quedado
   * pendientes en outbox por una interrupcion previa, un fallo transitorio
   * o un reinicio del servicio.
   *
   * Debe ser seguro ejecutarlo al iniciar el proceso para restaurar
   * continuidad operativa sin duplicar eventos ya publicados.
   */
  flushPendingInventoryLockRequests(): Promise<void>;

  /**
   * Publica un evento puntual de `InventoryLockRequested` identificado por
   * su registro de outbox.
   *
   * La implementacion debe leer el evento persistido, intentar su entrega
   * al bus de mensajeria y actualizar el estado tecnico del outbox segun
   * el resultado de la publicacion.
   *
   * @param outboxEventId Identificador tecnico del registro en `outbox_events`
   * que representa el evento pendiente de publicacion.
   */
  publishPendingInventoryLockRequest(outboxEventId: number): Promise<void>;

  flushPendingPaymentRequests(): Promise<void>;

  publishPendingPaymentRequest(outboxEventId: number): Promise<void>;
}
