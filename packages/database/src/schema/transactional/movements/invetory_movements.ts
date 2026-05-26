import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  bigserial,
  bigint,
  integer,
  text,
  check
} from "drizzle-orm/pg-core";
import { properties } from "../../core/properties/properties.js";
import { units } from "../../core/properties/index.js";
import { reservations } from "../reservations/index.js";
import { movementTypes } from "./movement_types.js";

import { currencies } from "../../core/catalog/index.js";
import { ownerPayoutStatuses } from "./owner_payouts_statuses.js";
import { sql } from "drizzle-orm";


export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id),
    unitId: bigint("unit_id", { mode: "number" }).notNull().references(() => units.id),
    reservationId: bigint("reservation_id", { mode: "number" }).notNull().references(() => reservations.id),
    movementTypeId: integer("movement_type_id").notNull().references(() => movementTypes.id),
    subType: varchar("sub_type", { length: 50 }),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    reason: text("reason"),
    referenceCode: varchar("reference_code", { length: 100 }),
    description: text("description"),
    overbookedAlternativeUnitid: bigint("overbooked_alternative_unitid", { mode: "number" }).references(() => units.id),
    compensationAmount: numeric("compensation_amount", { precision: 12, scale: 2 }),
    currencyId: bigint("currency_id", { mode: "number" }).references(() => currencies.id),
    initiadedBy: varchar("initiated_by", { length: 100 }),
    intiatedByUsersId: bigint("initiated_by_users_id", { mode: "number" }),
    correlationId: uuid("correlation_id").notNull(),
    causationId: uuid("causation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    inventoryDatesCheck: check("reservations_dates_check",
      sql`${table.endDate} > ${table.startDate}`,
    ),
  }),
);


// CREATE INDEX idx_inventory_movements_property ON inventory_movements(property_id);
// CREATE INDEX idx_inventory_movements_unit ON inventory_movements(unit_id);
// CREATE INDEX idx_inventory_movements_unit_dates ON inventory_movements(unit_id, start_date, end_date);
// CREATE INDEX idx_inventory_movements_reservation ON inventory_movements(reservation_id);
// CREATE INDEX idx_inventory_movements_type_status ON inventory_movements(movement_type, status);
// CREATE INDEX idx_inventory_movements_date_range ON inventory_movements(start_date, end_date);
// CREATE UNIQUE INDEX idx_inventory_movements_public ON inventory_movements(public_id);
// CREATE INDEX idx_inventory_movements_correlation ON inventory_movements(correlation_id);
// CREATE INDEX idx_inventory_movements_scheduled ON inventory_movements(scheduled_at) WHERE status = 'active';
