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
  draft: boolean;
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
  if (!fs.existsSync(DIR)) return [];
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
      draft: data.draft === true,
    } satisfies Article;
  });
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllArticles(): Article[] {
  return load();
}

export function getArticles(): Article[] {
  return load().filter((a) => !a.draft);
}

export function getDraftArticles(): Article[] {
  return load().filter((a) => a.draft);
}

export function getArticle(slug: string): Article | undefined {
  return load().find((a) => a.slug === slug);
}

export function getAdjacent(slug: string) {
  const list = getArticles();
  const idx = list.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: list[idx + 1],
    next: list[idx - 1],
  };
}
