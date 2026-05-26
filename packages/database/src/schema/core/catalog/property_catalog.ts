import {
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * HOUSE
 * APARTMENT
 * HOTEL
 * VILLA
 * CABIN
 * CONDO
 * TOWNHOUSE
 * BUNGALOW
 * LODGE
 * RESORT
 * HOSTEL
 * GUESTHOUSE
 * BED_BREAKFAST
 * BOAT
 * TINY_HOUSE
 * CASTLE
 * FARM
 * GLAMPING
 * COTTAGE
 * LOFT
 * DUPLEX
 * PENTHOUSE
 * STUDIO
 * ROOM
 * SHARED_ROOM
 */

export const propertyTypes = pgTable("property_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});


/**
 * 
 * ACTIVE      → visible y operable
 * INACTIVE    → existe, pero no se vende 
 * ONBOARDING  → cargándose/configurándose
 * SUSPENDED   → bloqueada por deuda, problema legal, contrato, etc.
 * ARCHIVED    → retirada del negocio
 */
export const propertyStatuses = pgTable("property_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});
