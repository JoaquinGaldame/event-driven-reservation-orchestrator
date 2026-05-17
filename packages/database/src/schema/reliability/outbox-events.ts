import {
  bigserial,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    eventId: uuid("event_id").defaultRandom().notNull(),
    aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),
    aggregateId: varchar("aggregate_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 150 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("PENDING"),
    retryCount: integer("retry_count").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    correlationId: uuid("correlation_id").notNull(),
    causationId: uuid("causation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: uniqueIndex("outbox_events_event_id_idx").on(table.eventId),
    statusAvailableIdx: index("outbox_events_status_available_idx").on(
      table.status,
      table.availableAt,
    ),
    eventTypeIdx: index("outbox_events_event_type_idx").on(table.eventType),
    correlationIdx: index("outbox_events_correlation_idx").on(
      table.correlationId,
    ),
    retryCheck: check(
      "outbox_events_retry_check",
      sql`${table.retryCount} >= 0`,
    ),
    statusCheck: check(
      "outbox_events_status_check",
      sql`${table.status} IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED')`,
    ),
  }),
);