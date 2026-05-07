import path from "node:path";
import type { Config } from "drizzle-kit";

const dbPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "articles.db");

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: dbPath },
} satisfies Config;
