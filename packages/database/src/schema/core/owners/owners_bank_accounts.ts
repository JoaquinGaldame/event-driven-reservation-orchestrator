import {
  bigint,
  bigserial,
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { currencies, owners } from "../index.js";

export const ownerBankAccounts = pgTable("owner_bank_accounts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ownerId: bigint("owner_id", { mode: "number" }).notNull().references(() => owners.id, { onDelete: "cascade" }),
  accountName: varchar("account_name", { length: 255 }).notNull(), // "Cuenta principal USD" | "Cuenta EUR España"
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  bankCountry: varchar("bank_country", { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  accountNumber: varchar("account_number", { length: 255 }).notNull(),
  accountCurrencyId: bigint("account_currency_id", { mode: "number" }).notNull().references(() => currencies.id),
  routingNumber: varchar("routing_number", { length: 255 }),
  swiftBic: varchar("swift_bic", { length: 20 }),
  iban: varchar("iban", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  // Beneficiary info (puede ser diferente al owner legal)
  beneficiaryName: varchar("beneficiary_name", { length: 255 }),
  beneficiaryTaxId: varchar("beneficiary_tax_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Índices
// idx_owner_bank_accounts_owner, idx_owner_bank_accounts_is_default