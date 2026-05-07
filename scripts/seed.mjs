import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const dbPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "articles.db");

const sqlite = new Database(dbPath);

const insert = sqlite.prepare(
  `INSERT OR IGNORE INTO articles
    (slug, language, title, subtitle, description, body, draft, date, created_at, updated_at)
   VALUES
    (@slug, @language, @title, @subtitle, @description, @body, @draft, @date, unixepoch(), unixepoch())`,
);

function isoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function loadFromDir(dir, language) {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  let count = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    insert.run({
      slug,
      language,
      title: String(data.title ?? ""),
      subtitle: String(data.subtitle ?? ""),
      description: String(data.description ?? ""),
      body: content.trim(),
      draft: data.draft === true ? 1 : 0,
      date: isoDate(data.date),
    });
    count++;
  }
  return count;
}

let total = 0;
total += loadFromDir(CONTENT_DIR, "en");
for (const lang of ["en", "sr", "de"]) {
  total += loadFromDir(path.join(CONTENT_DIR, lang), lang);
}
console.log(`Seeded ${total} articles into ${dbPath}.`);
sqlite.close();
