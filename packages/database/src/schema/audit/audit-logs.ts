import {
  bigserial,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    actorType: varchar("actor_type", { length: 50 }).notNull(),
    actorId: uuid("actor_id"),
    metadata: jsonb("metadata"),
    correlationId: uuid("correlation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("audit_logs_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    actorIdx: index("audit_logs_actor_idx").on(
      table.actorType,
      table.actorId,
    ),
    correlationIdx: index("audit_logs_correlation_idx").on(
      table.correlationId,
    ),
  }),
);