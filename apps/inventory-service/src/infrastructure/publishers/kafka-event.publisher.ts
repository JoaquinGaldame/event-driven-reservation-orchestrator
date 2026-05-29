import { db, eq, outboxEvents } from "@reservation/database";
import type { InventoryLockedEvent, InventoryRejectedEvent } from "@reservation/contracts";
import type { KafkaEventBus } from "@reservation/event-bus";
import type { EventPublisher } from "../../application/ports/event-publisher.js";

export class KafkaEventPublisher implements EventPublisher {

  constructor(private readonly eventBus: KafkaEventBus) {}

  async flushPendingInventoryResultEvents(): Promise<void> {
    const events = await db
      .select({
        id: outboxEvents.id,
        status: outboxEvents.status,
        eventType: outboxEvents.eventType,
      })
      .from(outboxEvents)
      .where(eq(outboxEvents.aggregateType, "inventory_lock"));

    for (const event of events) {
      if (event.status === "PUBLISHED") {
        continue;
      }

      await this.publishPendingInventoryResultEvent(event.id);
    }
  }

  async publishPendingInventoryResultEvent(outboxEventId: number): Promise<void> {
    const outboxEvent = await db.query.outboxEvents.findFirst({
      where: eq(outboxEvents.id, outboxEventId),
    });

    if (!outboxEvent) {
      throw new Error(`Outbox event not found: ${outboxEventId}`);
    }

    if ( outboxEvent.eventType !== "InventoryLocked" &&  outboxEvent.eventType !== "InventoryRejected" ) {
      throw new Error(
        `Unsupported outbox event type for inventory publisher: ${outboxEvent.eventType}`,
      );
    }

    if (outboxEvent.status === "PUBLISHED") {
      return;
    }

    await db
      .update(outboxEvents)
      .set({
        status: "PROCESSING",
      })
      .where(eq(outboxEvents.id, outboxEventId));

    try {
      if (outboxEvent.eventType === "InventoryLocked") {
        await this.eventBus.publish(outboxEvent.payload as InventoryLockedEvent);
      } else {
        await this.eventBus.publish(outboxEvent.payload as InventoryRejectedEvent);
      }

      await db
        .update(outboxEvents)
        .set({
          status: "PUBLISHED",
          publishedAt: new Date(),
        })
        .where(eq(outboxEvents.id, outboxEventId));
    } catch (error) {
      await db
        .update(outboxEvents)
        .set({
          status: "FAILED",
          retryCount: outboxEvent.retryCount + 1,
        })
        .where(eq(outboxEvents.id, outboxEventId));

      throw error;
    }
  }
}