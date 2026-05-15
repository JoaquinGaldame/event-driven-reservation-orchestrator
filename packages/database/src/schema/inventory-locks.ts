import {
  pgTable,
  uuid,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

export const inventoryLocks = pgTable("inventory_locks", {
  id: uuid("id").primaryKey(),
  reservationId: varchar("reservation_id", { length: 255 }).notNull(),
  propertyId: varchar("property_id", { length: 255 }).notNull(),
  unitId: varchar("unit_id", { length: 255 }).notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});