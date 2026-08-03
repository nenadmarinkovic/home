import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { db } from "../db/client";
import { articles } from "../db/schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function loadFromDir(dir: string, language: string): number {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  let inserted = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    db.insert(articles)
      .values({
        slug,
        language,
        title: String(data.title ?? ""),
        subtitle: String(data.subtitle ?? ""),
        description: String(data.description ?? ""),
        body: content.trim(),
        draft: data.draft === true,
        date: isoDate(data.date),
      })
      .onConflictDoNothing()
      .run();
    inserted++;
  }
  return inserted;
}

function main() {
  let total = 0;
  total += loadFromDir(CONTENT_DIR, "en");
  for (const lang of ["en", "sr", "de"]) {
    total += loadFromDir(path.join(CONTENT_DIR, lang), lang);
  }
  console.log(`Seeded ${total} articles.`);
}

main();
