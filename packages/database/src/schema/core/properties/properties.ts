import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { owners } from "../owners/owners.js";
import { currencies, provinces } from "../catalog/metadata.js";
import { propertyTypes } from "../catalog/property_catalog.js";



export const properties = pgTable(
  "properties",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    name: text("name").notNull(),
    displayName: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerId: bigint("owner_id", { mode: "number" }).notNull().references(() => owners.id),
    timezone: text("timezone").notNull().default("America/Argentina/Buenos_Aires"),
    currencyId: integer("currency_id").notNull().references(() => currencies.id),
    provinceId: integer("province_id").notNull().references(() => provinces.id),
    propertyTypeId: integer("property_type_id").notNull().references(() => propertyTypes.id),
    address: text("address"),
    status: text("status").notNull().default("ACTIVE"),
    maxGuests: integer("max_guests").notNull(),
    defaultCheckInMinutes: integer("default_check_in_minutes").notNull().default(900),
    defaultCheckOutMinutes: integer("default_check_out_minutes").notNull().default(660),
    allowOverbooking: boolean("allow_overbooking").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    publicIdIdx: uniqueIndex("properties_public_id_idx").on(table.publicId),
    slugIdx: uniqueIndex("properties_slug_idx").on(table.slug),
  }),
);