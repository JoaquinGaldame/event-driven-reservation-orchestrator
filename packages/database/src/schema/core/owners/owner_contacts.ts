import {
  bigint,
  bigserial,
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { owners } from "../index.js";
import { sql } from "drizzle-orm";

export const ownerContacts = pgTable("owner_contacts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ownerId: bigint("owner_id", { mode: "number" }).notNull().references(() => owners.id, { onDelete: "cascade" }),
  contactType: varchar("contact_type", { length: 50 }).notNull(), // 'operational' | 'financial' | 'legal' | 'emergency' | 'technical'
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Constraint: solo un contacto primario por owner
  onlyOnePrimaryPerOwner: uniqueIndex("owner_contacts_only_one_primary_idx")
    .on(table.ownerId)
    .where(sql`${table.isPrimary} = true`),
}));