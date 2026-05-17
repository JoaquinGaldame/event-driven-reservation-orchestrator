import {
  pgTable,
  timestamp,
  bigint,
  integer,
  numeric
} from "drizzle-orm/pg-core";
import { reservations } from "./reservations.js";
import { currencies } from "../../core/catalog/index.js";

/**
 * grossAmount: total amount before any discounts or taxes
 * discountAmount: total amount of discounts applied
 * taxAmount: total amount of taxes applied 
 * platformCommissionAmount: amount that the platform will take as commission
 * ownerPayoutAmount: amount that will be paid out to the property owner after deducting platform commission and adding any applicable taxes
 * currencyId: reference to the currency in which the amounts are calculated
 * calculatedAt: timestamp of when the financials were calculated, useful for tracking changes over time and for auditing purposes
 */
export const reservationFinancials = pgTable("reservation_financials", {
  reservationId: bigint("reservation_id", { mode: "number" }).primaryKey().references(() => reservations.id),
  grossAmount: numeric("gross_amount", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  platformCommissionAmount: numeric("platform_commission_amount", { precision: 12, scale: 2 }).notNull(),
  ownerPayoutAmount: numeric("owner_payout_amount", { precision: 12, scale: 2 }).notNull(),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
});