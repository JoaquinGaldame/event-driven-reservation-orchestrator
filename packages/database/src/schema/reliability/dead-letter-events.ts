import {
  bigserial,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Event failed 10 times. Cannot retry. => Submit to persistent DLQ.
export const deadLetterEvents = pgTable(
  "dead_letter_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    eventId: uuid("event_id").notNull(),
    eventType: varchar("event_type", { length: 150 }).notNull(),
    payload: jsonb("payload").notNull(),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").notNull(),
    failedService: varchar("failed_service", { length: 100 }).notNull(),
    correlationId: uuid("correlation_id"),
    causationId: uuid("causation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index("dead_letter_events_event_type_idx").on(
      table.eventType,
    ),
    failedServiceIdx: index("dead_letter_events_failed_service_idx").on(
      table.failedService,
    ),
    correlationIdx: index("dead_letter_events_correlation_idx").on(
      table.correlationId,
    ),
    retryCheck: check(
      "dead_letter_events_retry_check",
      sql`${table.retryCount} >= 0`,
    ),
  }),
);