import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://reservation_user:reservation_pass@localhost:55432/reservation_orchestrator";

const pool = new Pool({
  connectionString
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;