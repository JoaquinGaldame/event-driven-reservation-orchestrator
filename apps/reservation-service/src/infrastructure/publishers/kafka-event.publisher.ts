import {
  db,
  eq,
  outboxEvents,
} from "@reservation/database";
import type { InventoryLockRequestedEvent, PaymentRequestedEvent } from "@reservation/contracts";
import type { KafkaEventBus } from "@reservation/event-bus";
import type { EventPublisher } from "../../application/ports/event-publisher.js";

export class KafkaEventPublisher implements EventPublisher {
    constructor(private readonly eventBus: KafkaEventBus) {}

    async flushPendingInventoryLockRequests(): Promise<void> {
      const events = await db
        .select({
          id: outboxEvents.id,
          status: outboxEvents.status,
          eventType: outboxEvents.eventType,
        })
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "InventoryLockRequested"));

      for (const event of events) {
        if (event.status === "PUBLISHED") {
          continue;
        }

        await this.publishPendingInventoryLockRequest(event.id);
      }
    }

    async publishPendingInventoryLockRequest(outboxEventId: number): Promise<void> {
      const outboxEvent = await db.query.outboxEvents.findFirst({
        where: eq(outboxEvents.id, outboxEventId),
      });

      if (!outboxEvent) {
        throw new Error(`Outbox event not found: ${outboxEventId}`);
      }

      if (outboxEvent.eventType !== "InventoryLockRequested") {
        throw new Error(
          `Unsupported outbox event type for publisher: ${outboxEvent.eventType}`,
        );
      }

      if (outboxEvent.status === "PUBLISHED") {
        return;
      }

      await db
        .update(outboxEvents)
        .set({ status: "PROCESSING" })
        .where(eq(outboxEvents.id, outboxEventId));

      try {
        await this.eventBus.publish(
          outboxEvent.payload as InventoryLockRequestedEvent,
        );

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

    async flushPendingPaymentRequests(): Promise<void> {
      const events = await db
        .select({
          id: outboxEvents.id,
          status: outboxEvents.status,
          eventType: outboxEvents.eventType,
        })
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "PaymentRequested"));

      for (const event of events) {
        if (event.status === "PUBLISHED") {
          continue;
        }

        await this.publishPendingPaymentRequest(event.id);
      }
    }

    async publishPendingPaymentRequest(outboxEventId: number): Promise<void> {
      const outboxEvent = await db.query.outboxEvents.findFirst({
        where: eq(outboxEvents.id, outboxEventId),
      });

      if (!outboxEvent) {
        throw new Error(`Outbox event not found: ${outboxEventId}`);
      }

      if (outboxEvent.eventType !== "PaymentRequested") {
        throw new Error(
          `Unsupported outbox event type for publisher: ${outboxEvent.eventType}`,
        );
      }

      if (outboxEvent.status === "PUBLISHED") {
        return;
      }

      await db
        .update(outboxEvents)
        .set({ status: "PROCESSING" })
        .where(eq(outboxEvents.id, outboxEventId));

      try {
        await this.eventBus.publish(outboxEvent.payload as PaymentRequestedEvent);

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