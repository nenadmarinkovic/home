import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  dateLabel: string;
  note?: string[];
  body: string;
};

const DIR = path.join(process.cwd(), "content");

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function dateLabelFor(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function load(): Article[] {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  const list = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const { data, content } = matter(raw);
    const date = toIsoDate(data.date);
    return {
      slug,
      title: String(data.title ?? ""),
      subtitle: String(data.subtitle ?? ""),
      description: String(data.description ?? ""),
      date,
      dateLabel: dateLabelFor(date),
      note: Array.isArray(data.note) ? data.note.map(String) : undefined,
      body: content.trim(),
    } satisfies Article;
  });
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const articles: Article[] = load();

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAdjacent(slug: string) {
  const idx = articles.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: articles[idx + 1],
    next: articles[idx - 1],
  };
}
