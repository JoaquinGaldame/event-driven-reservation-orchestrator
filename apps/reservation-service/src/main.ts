import { KafkaEventBus } from "@reservation/event-bus";
import { logger } from "@reservation/logger";
import type { ReservationRequestedEvent } from "@reservation/contracts";

const eventBus = new KafkaEventBus({
  clientId: "reservation-service",
  brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
  groupId: "reservation-service"
});

eventBus.subscribe<ReservationRequestedEvent>(
  "ReservationRequested",
  async (event) => {
    logger.info("ReservationRequested received", {
      service: "reservation-service",
      reservationId: event.payload.reservationId,
      propertyId: event.payload.propertyId,
      unitId: event.payload.unitId,
      channel: event.payload.channel,
      checkIn: event.payload.checkIn,
      checkOut: event.payload.checkOut,
      correlationId: event.correlationId
    });
  }
);

await eventBus.startConsuming(["ReservationRequested"]);

logger.info("Reservation service started", {
  service: "reservation-service"
});