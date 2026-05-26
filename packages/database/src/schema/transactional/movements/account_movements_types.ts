import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * GUEST
 * PLATFORM
 * OWNER
 * TAX_AUTHORITY
 */
export const accountMovementTypes = pgTable("account_movement_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});