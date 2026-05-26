import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * ROOM_RATE
 * CLEANING_FEE
 * SERVICE_FEE
 * TAX
 * DISCOUNT
 * OWNER_FEE
 * EXTRA_GUEST_FEE
 */
export const chargesTypes = pgTable("charges_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});