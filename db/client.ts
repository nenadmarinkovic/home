import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

const DEFAULT_DEV_PATH = path.join(process.cwd(), "data", "articles.db");

function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_PATH;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return DEFAULT_DEV_PATH;
}

let _db: Db | null = null;

function ensureDb(): Db {
  if (_db) return _db;
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  _db = drizzle(sqlite, { schema });
  return _db;
}

// Lazy proxy: nothing opens the DB until a method is actually called on it.
// This keeps `next build`'s page-data collection workers from contending for
// the SQLite lock at module load.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(ensureDb() as object, prop, receiver);
  },
});

export { schema };
