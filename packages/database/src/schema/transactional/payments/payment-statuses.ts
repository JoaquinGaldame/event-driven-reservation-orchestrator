import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


/**
 * PENDING
 * AUTHORIZED
 * CAPTURED
 * FAILED
 * CANCELLED
 * REFUNDED
 * PARTIALLY_REFUNDED
 */
export const paymentStatuses = pgTable("payments_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});