import {
  bigserial,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { channelTypes } from "./channel-types.js";
import { channelStatuses } from "./channel-statuses.js";

export const channels = pgTable(
  "channels",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    typeId: integer("type_id").notNull().references(() => channelTypes.id),
    statusId: integer("status_id").notNull().references(() => channelStatuses.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    idIdx: uniqueIndex("channels_id_idx").on(table.id),
    codeIdx: uniqueIndex("channels_code_idx").on(table.code),
  }),
);