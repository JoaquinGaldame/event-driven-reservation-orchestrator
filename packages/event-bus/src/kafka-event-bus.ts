import { Kafka, type Consumer, type Producer } from "kafkajs";
import { logger } from "@reservation/logger";
import type { DomainEvent, EventBus, EventHandler } from "./types.js";

type KafkaEventBusOptions = {
  clientId: string;
  brokers: string[];
  groupId: string;
};

export class KafkaEventBus implements EventBus {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private readonly handlers = new Map<string, EventHandler[]>();
  private connected = false;

  constructor(options: KafkaEventBusOptions) {
    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: options.groupId
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    await this.producer.connect();
    await this.consumer.connect();

    this.connected = true;

    logger.info("KafkaEventBus connected");
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();

    this.connected = false;

    logger.info("KafkaEventBus disconnected");
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    await this.connect();

    await this.producer.send({
      topic: event.eventType,
      messages: [
        {
          key: "eventId" in event ? String(event.eventId) : undefined,
          value: JSON.stringify(event)
        }
      ]
    });

    logger.info("Kafka event published", {
      eventType: event.eventType
    });
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventType, existing);

    logger.info("Kafka handler registered", {
      eventType
    });
  }

  async startConsuming(eventTypes: string[]): Promise<void> {
    await this.connect();

    for (const eventType of eventTypes) {
      await this.consumer.subscribe({
        topic: eventType,
        fromBeginning: false
      });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        const handlers = this.handlers.get(topic) ?? [];

        const event = JSON.parse(message.value.toString()) as DomainEvent;

        logger.info("Kafka event received", {
          eventType: topic,
          handlers: handlers.length
        });

        await Promise.all(
          handlers.map((handler) => handler(event))
        );
      }
    });
  }
}