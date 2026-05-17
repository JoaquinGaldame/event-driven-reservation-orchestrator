import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  bigserial,
  bigint,
  integer,
  text,
  numeric
} from "drizzle-orm/pg-core";
import { reservations } from "./reservations.js";
import { chargesTypes } from "../../core/catalog/reservations_catalog.js";

export const reservationCharges = pgTable("reservation_charges", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  reservationId: bigint("reservation_id", { mode: "number" }).notNull().references(() => reservations.id),
  chargeTypeId: integer("charge_type_id").notNull().references(() => chargesTypes.id),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});