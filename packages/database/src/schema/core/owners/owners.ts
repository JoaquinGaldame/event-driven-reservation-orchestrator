import {
  bigint,
  bigserial,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ownerStatuses, ownerTypes } from "../catalog/owners_catalog.js";



export const owners = pgTable("owners", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  publicId: uuid("public_id").defaultRandom().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(), // Nombre - First name
  lastName: varchar("last_name", { length: 100 }), // Apellido - Last name
  legalName: varchar("legal_name", { length: 255 }),  // Razón social - legal name
  tradingName: varchar("trading_name", { length: 255 }), // Nombre comercial - Commercial name
  taxId: varchar("tax_id", { length: 100 }), // CUIT / RUT / VAT / EIN (organizations)
  typeId: integer("type_id").notNull().references(() => ownerTypes.id),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  billingEmail: varchar("billing_email", { length: 255 }),
  preferredLanguage: varchar("preferred_language", { length: 2 }).default('en'),
  documentType: varchar("document_type", { length: 50 }),
  documentNumber: varchar("document_number", { length: 100 }),
  statusId: integer("status_id").notNull().references(() => ownerStatuses.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  // Índices nuevos
  taxIdIdx: uniqueIndex("owners_tax_id_idx").on(table.taxId),
  ownerTypesIdx: index("owners_owner_type_idx").on(table.typeId),
}));