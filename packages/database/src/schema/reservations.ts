import {
  pgTable,
  uuid,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey(),
  propertyId: varchar("property_id", { length: 255 }).notNull(),
  unitId: varchar("unit_id", { length: 255 }).notNull(),
  guestName: varchar("guest_name", { length: 255 }),
  channel: varchar("channel", { length: 100 }).notNull(),
  checkIn: timestamp("check_in", { withTimezone: true }).notNull(),
  checkOut: timestamp("check_out", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  rejectionReason: varchar("rejection_reason", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});