import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://reservation_user:reservation_pass@localhost:55432/reservation_orchestrator"
  }
} satisfies Config;