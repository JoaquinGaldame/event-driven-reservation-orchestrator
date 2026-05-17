import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgTable,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { units } from "../properties/units.js";
import { currencies } from "../catalog/metadata.js";


/**
 * PRICING REAL: Se calcula a partir de unit_daily_rates, buscando la fecha de la reserva. Si no hay tarifa para esa fecha, se usa el base_price_per_night de la unidad.
 * Sin tarifa: units.base_price_per_night
 * Precio con reserva: unit_daily_rates.price_per_night desde chek_in hasta check_out - 1 día
 */
export const unitDailyRates = pgTable(
  "unit_daily_rates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    unitId: bigint("unit_id", { mode: "number" }).notNull().references(() => units.id),
    date: timestamp("date", { withTimezone: false }).notNull(),
    currencyId: integer("currency_id").notNull().references(() => currencies.id),
    pricePerNight: integer("price_per_night").notNull(),
    minStayNights: integer("min_stay_nights"),
    maxStayNights: integer("max_stay_nights"),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    unitDateIdx: uniqueIndex("unit_daily_rates_unit_date_idx").on(
      table.unitId,
      table.date,
    ),
  }),
);