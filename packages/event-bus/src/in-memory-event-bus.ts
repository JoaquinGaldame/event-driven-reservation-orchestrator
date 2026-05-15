import { logger } from "@reservation/logger";
import type { DomainEvent, EventBus, EventHandler } from "./types.js";

// Despues reemplazamos InMemoryEventBus por KafkaEventBus

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>();

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];

    logger.info("Publishing event", {
      eventType: event.eventType,
      handlers: handlers.length
    });

    await Promise.all(
      handlers.map((handler) => handler(event))
    );
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventType, existing);

    logger.info("Subscribed handler", {
      eventType
    });
  }
}