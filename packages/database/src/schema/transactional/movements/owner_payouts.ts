import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  bigserial,
  bigint,
  integer,
  text,
  check
} from "drizzle-orm/pg-core";
import { owners } from "../../core/owners/owners.js";
import { properties } from "../../core/properties/properties.js";
import { reservations } from "../reservations/index.js";
import { currencies } from "../../core/catalog/index.js";
import { ownerPayoutStatuses } from "./owner_payouts_statuses.js";
import { sql } from "drizzle-orm";


export const ownerPayouts = pgTable(
  "owner_payouts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    ownerId: bigint("owner_id", { mode: "number" }).notNull().references(() => owners.id),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id),
    reservationId: bigint("reservation_id", { mode: "number" }).notNull().references(() => reservations.id),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currencyId: bigint("currency_id", { mode: "number" }).notNull().references(() => currencies.id),
    platformCommission: numeric("platform_commission", { precision: 12, scale: 2 }).notNull(),
    taxesWithheld: numeric("taxes_withheld", { precision: 12, scale: 2 }).notNull(),
    adjustments: numeric("adjustments", { precision: 12, scale: 2 }).notNull().default("0"),
    netAmount: numeric("net_amount", { precision: 12, scale: 2 }).notNull(), // total_amount - commission - taxes_withheld + adjustments
    statusId: integer("status_id").notNull().references(() => ownerPayoutStatuses.id),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    processedDate: timestamp("processed_date", { withTimezone: true }),
    failedDate: timestamp("failed_date", { withTimezone: true }),
    failureReason: text("failure_reason"),
    provider: varchar("provider", { length: 50 }),
    providerPayoutId: varchar("provider_payout_id", { length: 255 }),
    providerReference: varchar("provider_reference", { length: 255 }),
    splitSequence: integer("split_sequence").notNull().default(1),
    splitTotal: integer("split_total").notNull().default(1),
    correlationId: uuid("correlation_id").notNull(),
    causationId: uuid("causation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    netAmountCheck: check("net_amount_check", sql`${table.netAmount} >= 0`),
  }),
);

// CREATE INDEX idx_owner_payouts_owner ON owner_payouts(owner_id);
// CREATE INDEX idx_owner_payouts_property ON owner_payouts(property_id);
// CREATE INDEX idx_owner_payouts_reservation ON owner_payouts(reservation_id);
// CREATE INDEX idx_owner_payouts_status ON owner_payouts(status);
// CREATE INDEX idx_owner_payouts_scheduled_date ON owner_payouts(scheduled_date);
// CREATE UNIQUE INDEX idx_owner_payouts_code ON owner_payouts(payout_code);
// CREATE UNIQUE INDEX idx_owner_payouts_public ON owner_payouts(public_id);
// CREATE INDEX idx_owner_payouts_correlation ON owner_payouts(correlation_id);