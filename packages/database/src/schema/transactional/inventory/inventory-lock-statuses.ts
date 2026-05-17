import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


/**
 * ACTIVE
 * RELEASED
 * EXPIRED
 * CANCELLED
 */
export const inventoryLockStatuses = pgTable("inventory_lock_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});