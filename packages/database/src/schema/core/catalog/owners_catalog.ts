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


/**
 * individual: Individual owner, typically a single person who owns one or more properties.
 * company: A business entity that owns properties, which could be a small business or a large corporation.
 * ngo: Non-governmental organizations that own properties, often for charitable or social purposes.
 * government: Government entities that own properties, which could include public housing, parks, or other facilities.
 * trust: A legal arrangement where a trustee holds property on behalf of beneficiaries, which could be individuals, organizations, or a combination of both.
 */
export const ownerTypes = pgTable("owner_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).notNull().unique(),
});
