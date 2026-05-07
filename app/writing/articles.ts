import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { articles, type ArticleRow, type Language } from "@/db/schema";

export type Article = {
  slug: string;
  language: Language;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  dateLabel: string;
  body: string;
  draft: boolean;
};

const DEFAULT_LANG: Language = "en";

function dateLabelFor(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function rowToArticle(row: ArticleRow): Article {
  return {
    slug: row.slug,
    language: row.language as Language,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    body: row.body,
    draft: row.draft,
    date: row.date,
    dateLabel: dateLabelFor(row.date),
  };
}

export function getArticles(language: Language = DEFAULT_LANG): Article[] {
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.language, language), eq(articles.draft, false)))
    .orderBy(desc(articles.date))
    .all()
    .map(rowToArticle);
}

export function getDraftArticles(
  language: Language = DEFAULT_LANG,
): Article[] {
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.language, language), eq(articles.draft, true)))
    .orderBy(desc(articles.date))
    .all()
    .map(rowToArticle);
}

export function getAllArticles(
  language: Language = DEFAULT_LANG,
): Article[] {
  return db
    .select()
    .from(articles)
    .where(eq(articles.language, language))
    .orderBy(desc(articles.date))
    .all()
    .map(rowToArticle);
}

export function getArticle(
  slug: string,
  language: Language = DEFAULT_LANG,
): Article | undefined {
  const row = db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.language, language)))
    .get();
  return row ? rowToArticle(row) : undefined;
}

export function getAdjacent(slug: string, language: Language = DEFAULT_LANG) {
  const list = getArticles(language);
  const idx = list.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return { prev: list[idx + 1], next: list[idx - 1] };
}
