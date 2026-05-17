import {
  bigint,
  bigserial,
  integer,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { properties } from "../properties/index.js";
import { commissionTypes } from "../catalog/index.js";


/**
 * guardar porcentajes en basis points (1% = 100 basis points) para evitar problemas de precisión con decimales
 * ejemplo: 15% = 1500 basis points, 2.5% = 250 basis points
 */
export const propertyOwnerCommissionRules = pgTable(
  "property_owner_commission_rules",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id),
    commissionTypeId: integer("commission_type_id").notNull().references(() => commissionTypes.id),
    value: integer("value").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
);