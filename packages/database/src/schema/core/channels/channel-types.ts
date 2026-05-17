import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * OTA - Online Travel Agency
 * DIRECT
 * ADMIN
 * API
 */
export const channelTypes = pgTable("channel_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});