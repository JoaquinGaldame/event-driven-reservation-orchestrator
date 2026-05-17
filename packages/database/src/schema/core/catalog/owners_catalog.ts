import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * ACTIVE
 * INACTIVE
 * SUSPENDED
 * ARCHIVED
 */
export const ownerStatuses = pgTable("owner_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});


/**
 * PERCENTAGE
 * FIXED_PER_RESERVATION
 * FIXED_PER_NIGHT
 */
export const commissionTypes = pgTable("commission_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});