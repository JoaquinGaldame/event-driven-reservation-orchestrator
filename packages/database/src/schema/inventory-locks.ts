import {
  pgTable,
  uuid,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

import { reservations } from "./reservations.js";

export const inventoryLocks = pgTable("inventory_locks", {
  id: uuid("id").primaryKey(),
  reservationId: uuid("reservation_id")
    .notNull()
    .references(() => reservations.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id", { length: 255 }).notNull(),
  unitId: varchar("unit_id", { length: 255 }).notNull(),
  checkIn: timestamp("check_in", { withTimezone: true }).notNull(),
  checkOut: timestamp("check_out", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});