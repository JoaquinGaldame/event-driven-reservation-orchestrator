import {
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";


/**
 * ROOM
 * APARTMENT
 * HOUSE
 * CABIN
 * BED
 * SUITE
 */
export const unitTypes = pgTable("unit_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});


/**
 * ACTIVE
 * INACTIVE
 * MAINTENANCE
 * BLOCKED
 * ARCHIVED
 */
export const unitStatuses = pgTable("unit_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});
