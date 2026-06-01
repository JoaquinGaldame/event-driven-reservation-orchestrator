import {
  bigserial,
  bigint,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { paymentsAttemptsStatuses } from "./payment-attemp-statuses.js";
import { payments } from "./payments.js";

export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    paymentId: bigint("payment_id", { mode: "number" }).notNull().references(() => payments.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    statusId: integer("status_id").notNull().references(() => paymentsAttemptsStatuses.id, { onDelete: "restrict" }),
    errorCode: varchar("error_code", { length: 100 }),
    errorMessage: text("error_message"),
    correlationId: uuid("correlation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    paymentIdx: index("payment_attempts_payment_idx").on(table.paymentId),
    paymentAttemptNumberUq: uniqueIndex(
      "payment_attempts_payment_attempt_number_uq",
    ).on(table.paymentId, table.attemptNumber),
    statusIdx: index("payment_attempts_status_id_idx").on(table.statusId),
    correlationIdx: index("payment_attempts_correlation_idx").on(
      table.correlationId,
    ),
    attemptNumberCheck: check(
      "payment_attempts_attempt_number_check",
      sql`${table.attemptNumber} > 0`,
    ),
  }),
);
