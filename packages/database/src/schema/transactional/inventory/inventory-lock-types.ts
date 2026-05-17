import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * TEMP_HOLD
 * CONFIRMED_LOCK
 * OWNER_BLOCK
 * MAINTENANCE_BLOCK
 */
export const inventoryLockTypes = pgTable("inventory_lock_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});