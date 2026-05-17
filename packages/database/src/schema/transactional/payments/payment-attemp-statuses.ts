import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


/**
 * PENDING
 * PROCESSING
 * SUCCEEDED
 * FAILED
 * CANCELLED
 */
export const paymentsAttemptsStatuses = pgTable("payments_attempts_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});