import {
  bigserial,
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { countries, languages } from "../catalog/index.js";

export const guests = pgTable(
  "guests",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    code: integer("code").notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    documentType: varchar("document_type", { length: 50 }),
    documentNumber: varchar("document_number", { length: 100 }),
    nationalityId: integer("nationality_id").references(() => countries.id),
    languageId: integer("language_id").references(() => languages.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    codeIdx: uniqueIndex("guests_public_code_idx").on(table.code),
    emailIdx: index("guests_email_idx").on(table.email),
    documentIdx: index("guests_document_idx").on(
      table.documentType,
      table.documentNumber,
    ),
    guestContactCheck: check(
      "guests_contact_check",
      sql`${table.email} IS NOT NULL OR ${table.phone} IS NOT NULL`,
    ),
  }),
);