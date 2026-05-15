export type DomainEvent = {
  eventType: string;
};

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

export interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
}