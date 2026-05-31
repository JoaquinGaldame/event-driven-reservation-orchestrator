export interface EventPublisher {
  flushPendingPaymentResultEvents(): Promise<void>;
  publishPendingPaymentResultEvent(outboxEventId: number): Promise<void>;
}