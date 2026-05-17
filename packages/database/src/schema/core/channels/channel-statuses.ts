import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * ACTIVE
 * INACTIVE
 * SUSPENDED
 * DEPRECATED
 */
export const channelStatuses = pgTable("channel_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});