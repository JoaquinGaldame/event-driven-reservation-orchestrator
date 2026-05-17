import {
  bigserial,
  bigint,
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { properties } from "../../core/properties/index.js";
import { units } from "../../core/properties/index.js";
import { reservations } from "../reservations/index.js";
import { inventoryLockTypes } from "./inventory-lock-types.js";
import { inventoryLockStatuses } from "./inventory-lock-statuses.js";

export const inventoryLocks = pgTable(
  "inventory_locks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    reservationId: bigint("reservation_id", { mode: "number" }).notNull().references(() => reservations.id, { onDelete: "cascade" }),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id, { onDelete: "restrict" }),
    unitId: bigint("unit_id", { mode: "number" }).notNull().references(() => units.id, { onDelete: "restrict" }),
    lockTypeId: integer("lock_type_id").notNull().references(() => inventoryLockTypes.id, { onDelete: "restrict" }),
    statusId: integer("status_id").notNull().references(() => inventoryLockStatuses.id, { onDelete: "restrict" }),
    checkIn: timestamp("check_in", { withTimezone: true }).notNull(),
    checkOut: timestamp("check_out", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    correlationId: uuid("correlation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    reservationIdx: uniqueIndex("inventory_locks_reservation_idx").on(
      table.reservationId,
    ),
    unitDatesIdx: index("inventory_locks_unit_dates_idx").on(
      table.unitId,
      table.checkIn,
      table.checkOut,
    ),
    statusIdx: index("inventory_locks_status_idx").on(table.statusId),
    lockTypeIdx: index("inventory_locks_type_idx").on(table.lockTypeId),
    correlationIdx: index("inventory_locks_correlation_idx").on(
      table.correlationId,
    ),
    dateRangeCheck: check(
      "inventory_locks_date_range_check",
      sql`${table.checkOut} > ${table.checkIn}`,
    ),
  }),
);