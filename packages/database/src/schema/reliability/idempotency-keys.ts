import {
  bigserial,
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// mismo request => misma respuesta
export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    scope: varchar("scope", { length: 100 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    requestHash: varchar("request_hash", { length: 255 }).notNull(),
    responsePayload: jsonb("response_payload"),
    status: varchar("status", { length: 50 }).notNull().default("PROCESSING"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    publicIdIdx: uniqueIndex("idempotency_keys_public_id_idx").on(table.publicId),
    scopeKeyIdx: uniqueIndex("idempotency_keys_scope_key_idx").on(
      table.scope,
      table.idempotencyKey,
    ),
    statusIdx: index("idempotency_keys_status_idx").on(table.status),
    statusCheck: check(
      "idempotency_keys_status_check",
      sql`${table.status} IN ('PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')`,
    ),
  }),
);