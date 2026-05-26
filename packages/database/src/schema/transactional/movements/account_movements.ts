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
import { payments } from "../index.js";
import { accountMovementTypes } from "./account_movements_types.js";
import { ledgerEntryTypes } from "./ledger_entry_types.js";
import { sql } from "drizzle-orm";

export const accountMovements = pgTable(
  "account_movements",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    reservationId: bigint("reservation_id", { mode: "number" }).notNull(),
    paymentId: bigint("payment_id", { mode: "number" }).notNull().references(() => payments.id),
    ownerPayoutId: bigint("owner_payout_id", { mode: "number" }),
    accountTypeId: integer("account_type_id").notNull().references(() => accountMovementTypes.id),
    accountIdentifier: varchar("account_identifier", { length: 255 }).notNull(),
    movementType: varchar("movement_type", { length: 50 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currencyId: bigint("currency_id", { mode: "number" }).notNull().references(() => payments.currencyId),
    description: text("description"),
    ledgerEntryTypeId: integer("ledger_entry_type_id").notNull().references(() => ledgerEntryTypes.id),
    reversedAt: timestamp("reversed_at", { withTimezone: true }),
    reversedByMovementId: bigint("reversed_by_movement_id", { mode: "number" }),
    correlationId: uuid("correlation_id").notNull(),
    causationId: uuid("causation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    amountCheck: check("payments_amount_check", sql`${table.amount} >= 0`),
  }),
);

// CREATE INDEX idx_account_movements_reservation ON account_movements(reservation_id);
// CREATE INDEX idx_account_movements_payment ON account_movements(payment_id);
// CREATE INDEX idx_account_movements_owner_payout ON account_movements(owner_payout_id);
// CREATE INDEX idx_account_movements_account ON account_movements(account_type, account_identifier);
// CREATE INDEX idx_account_movements_correlation ON account_movements(correlation_id);
// CREATE INDEX idx_account_movements_effective_date ON account_movements(effective_date);
// CREATE UNIQUE INDEX idx_account_movements_public ON account_movements(public_id);