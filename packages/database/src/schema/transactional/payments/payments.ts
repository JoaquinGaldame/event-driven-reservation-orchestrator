import {
  bigserial,
  bigint,
  check,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { paymentStatuses } from "./payment-statuses.js";
import { reservations } from "../reservations/index.js";
import { currencies } from "../../core/catalog/index.js";


/**
 * Payments table to store all payment transactions related to reservations. Each payment can have multiple attempts, which are stored in the payments_attempts table. The status of each payment is determined by the payment_statuses table, and the amount is stored with its currency for accurate financial reporting and processing.
 * providerReference: reference that you send to the supplier to identify the payment
 * externalReceiptNumber: receipt issued by the supplier.
 * correlationId: It is a distributed traceability identifier.
 * causationId: used for tracing the origin of the payment action, useful for debugging and auditing purposes.
 */
export const payments = pgTable(
  "payments",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    internalCode: uuid("internal_code").defaultRandom().notNull(),
    reservationId: bigint("reservation_id", { mode: "number" }).notNull().references(() => reservations.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerPaymentId: varchar("provider_payment_id", { length: 255 }),
    providerReference: varchar("provider_reference", { length: 255 }),
    externalReceiptNumber: varchar("external_receipt_number", { length: 255 }),
    currencyId: bigint("currency_id", { mode: "number" }).notNull().references(() => currencies.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    statusId: integer("status_id").notNull().references(() => paymentStatuses.id, { onDelete: "restrict" }),
    causationId: uuid("causation_id"),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    capturedAt: timestamp("captured_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    correlationId: uuid("correlation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    internalCodeIdx: uniqueIndex("payments_internal_code_idx").on(table.internalCode),
    reservationIdx: index("payments_reservation_idx").on(table.reservationId),
    providerPaymentIdx: index("payments_provider_payment_idx").on(
      table.provider,
      table.providerPaymentId,
    ),
    statusIdx: index("payments_status_id_idx").on(table.statusId),
    correlationIdx: index("payments_correlation_idx").on(table.correlationId),
    amountCheck: check("payments_amount_check", sql`${table.amount} >= 0`),
  }),
);