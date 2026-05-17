import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { properties } from "./properties.js";
import { unitStatuses, unitTypes } from "../catalog/units_catalog.js";



export const units = pgTable(
  "units",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id),
    unitTypeId: integer("unit_type_id").notNull().references(() => unitTypes.id),
    statusId: integer("status_id").notNull().references(() => unitStatuses.id),
    name: varchar("name", { length: 150 }).notNull(),
    code: varchar("code", { length: 80 }).notNull(),
    maxGuests: integer("max_guests").notNull(),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    basePricePerNight: integer("base_price_per_night").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    publicIdIdx: uniqueIndex("units_public_id_idx").on(table.publicId),
    propertyCodeIdx: uniqueIndex("units_property_code_idx").on(
      table.propertyId,
      table.code,
    ),
  }),
);