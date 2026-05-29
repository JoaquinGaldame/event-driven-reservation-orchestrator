export interface EventPublisher {
  flushPendingInventoryResultEvents(): Promise<void>;
  publishPendingInventoryResultEvent(outboxEventId: number): Promise<void>;
}