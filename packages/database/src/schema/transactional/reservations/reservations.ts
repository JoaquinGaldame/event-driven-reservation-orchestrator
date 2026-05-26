import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  bigserial,
  bigint,
  date,
  integer,
  text,
  uniqueIndex,
  index,
  check
} from "drizzle-orm/pg-core";
import { properties } from "../../core/properties/properties.js";
import { units } from "../../core/properties/index.js";
import { reservationStatuses } from "./reservation_statuses.js";
import { currencies } from "../../core/catalog/index.js";
import { sql } from "drizzle-orm";
import { guests } from "../../core/guests/guest.js";
import { channels } from "../../core/channels/channels.js";

export const reservations = pgTable(
  "reservations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    code: uuid("code").defaultRandom().notNull(),
    propertyId: bigint("property_id", { mode: "number" }).notNull().references(() => properties.id),
    unitId: bigint("unit_id", { mode: "number" }).notNull().references(() => units.id),
    guestId: bigint("guest_id", { mode: "number" }).references(() => guests.id),
    channelId: bigint("channel_id", { mode: "number" }).notNull().references(() => channels.id),
    currencyId: bigint("currency_id", { mode: "number" }).notNull().references(() => currencies.id),
    reservationNumber: varchar("reservation_number", { length: 50 }).notNull(),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    status: integer("status").notNull().references(() => reservationStatuses.id),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    rejectionReason: text("rejection_reason"),
    idempotencyKey: varchar("idempotency_key", { length: 150 }).notNull(),
    correlationId: uuid("correlation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    codeIdx: uniqueIndex("reservations_code_idx").on(table.code),
    reservationNumberIdx: uniqueIndex("reservations_number_idx").on(table.reservationNumber),
    idempotencyIdx: uniqueIndex("reservations_channel_idempotency_idx").on(
      table.channelId,
      table.idempotencyKey,
    ),
    unitDatesIdx: index("reservations_unit_dates_idx").on(
      table.unitId,
      table.checkIn,
      table.checkOut,
    ),
    datesCheck: check("reservations_dates_check",
      sql`${table.checkOut} > ${table.checkIn}`,
    ),
  }),
);