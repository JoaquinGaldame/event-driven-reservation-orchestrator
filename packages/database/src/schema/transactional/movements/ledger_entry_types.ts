import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * ACTUAL
 * PENDING
 * REVERSED
 */
export const ledgerEntryTypes = pgTable("ledger_entry_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
});