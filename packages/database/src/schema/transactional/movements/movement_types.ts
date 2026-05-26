import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * reservation
 * maintenance
 * owner_hold
 * blocked
 * reactivated
 * cleaning
 * inspection
 */
export const movementTypes = pgTable("movement_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
});