import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * PENDING
 * CONFIRMED
 * REJECTED
 * CANCELLED
 * PAYMENT_REQUIRED
 * PAYMENT_CONFIRMED
 */
export const reservationStatuses = pgTable("reservation_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});