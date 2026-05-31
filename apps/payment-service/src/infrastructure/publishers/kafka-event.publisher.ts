import { db, eq, outboxEvents } from "@reservation/database";
import type {
  PaymentCapturedEvent,
  PaymentFailedEvent,
} from "@reservation/contracts";
import type { KafkaEventBus } from "@reservation/event-bus";
import type { EventPublisher } from "../../application/ports/event-publisher.js";

export class KafkaEventPublisher implements EventPublisher {
  constructor(private readonly eventBus: KafkaEventBus) {}

  async flushPendingPaymentResultEvents(): Promise<void> {
    const events = await db
      .select({
        id: outboxEvents.id,
        status: outboxEvents.status,
        eventType: outboxEvents.eventType,
      })
      .from(outboxEvents)
      .where(eq(outboxEvents.aggregateType, "payment"));

    for (const event of events) {
      if (event.status === "PUBLISHED") {
        continue;
      }

      await this.publishPendingPaymentResultEvent(event.id);
    }
  }

  async publishPendingPaymentResultEvent(outboxEventId: number): Promise<void> {
    const outboxEvent = await db.query.outboxEvents.findFirst({
      where: eq(outboxEvents.id, outboxEventId),
    });

    if (!outboxEvent) {
      throw new Error(`Outbox event not found: ${outboxEventId}`);
    }

    if (
      outboxEvent.eventType !== "PaymentCaptured" &&
      outboxEvent.eventType !== "PaymentFailed"
    ) {
      throw new Error(
        `Unsupported outbox event type for payment publisher: ${outboxEvent.eventType}`,
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
      if (outboxEvent.eventType === "PaymentCaptured") {
        await this.eventBus.publish(outboxEvent.payload as PaymentCapturedEvent);
      } else {
        await this.eventBus.publish(outboxEvent.payload as PaymentFailedEvent);
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