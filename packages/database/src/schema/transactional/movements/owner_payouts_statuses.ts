import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * PENDING
 * PROCESSING
 * COMPLETED
 * FAILED
 * CANCELLED
 */
export const ownerPayoutStatuses = pgTable("owner_payout_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
});