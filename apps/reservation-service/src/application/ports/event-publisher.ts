export interface EventPublisher {
  flushPendingInventoryLockRequests(): Promise<void>;
  publishPendingInventoryLockRequest(outboxEventId: number): Promise<void>;
}
