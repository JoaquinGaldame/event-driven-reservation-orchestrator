import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


/**
 * PENDING
 * AUTHORIZED
 * CONFIRMED
 * FAILED
 * CANCELLED
 * REFUNDED
 * PARTIALLY_REFUNDED
 * EXPIRED
 */
export const paymentStatuses = pgTable("payments_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
});