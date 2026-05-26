import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const provinces = pgTable("provinces", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  countryId: integer("country_id").notNull().references(() => countries.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
});


export const currencies = pgTable("currencies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 3 }).notNull().unique(), // USD, ARS, BRL
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  decimalPlaces: integer("decimal_places").notNull().default(2),
});

// ISO 639-1
export const languages = pgTable("languages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  codeIso: varchar("code_iso", { length: 2 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
});