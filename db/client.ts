import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const DEFAULT_DEV_PATH = path.join(process.cwd(), "data", "articles.db");

function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_PATH;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return DEFAULT_DEV_PATH;
}

const dbPath = resolveDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
