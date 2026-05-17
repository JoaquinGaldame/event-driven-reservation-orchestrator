import {
  bigserial,
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";


// business history - Event Sourcing
export const domainEvents = pgTable(
  "domain_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    eventId: uuid("event_id").notNull(),
    aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),
    aggregateId: varchar("aggregate_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 150 }).notNull(),
    payload: jsonb("payload").notNull(),
    correlationId: uuid("correlation_id"),
    causationId: uuid("causation_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    eventIdIdx: uniqueIndex("domain_events_event_id_idx").on(table.eventId),
    aggregateIdx: index("domain_events_aggregate_idx").on(
      table.aggregateType,
      table.aggregateId,
    ),
    eventTypeIdx: index("domain_events_event_type_idx").on(table.eventType),
    correlationIdx: index("domain_events_correlation_idx").on(
      table.correlationId,
    ),
  }),
);