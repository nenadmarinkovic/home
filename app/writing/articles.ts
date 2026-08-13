import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { articles, type ArticleRow, type Language } from "@/db/schema";

export type Article = {
  slug: string;
  language: Language;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  date: string;
  dateLabel: string;
  body: string;
  draft: boolean;
};

const DEFAULT_LANG: Language = "en";
export const ARTICLES_TAG = "articles";

export function dateLabelFor(iso: string): string {
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
    image: row.image,
    body: row.body,
    draft: row.draft,
    date: row.date,
    dateLabel: dateLabelFor(row.date),
  };
}

const fetchPublished = unstable_cache(
  async (language: Language): Promise<Article[]> => {
    return db
      .select()
      .from(articles)
      .where(and(eq(articles.language, language), eq(articles.draft, false)))
      .orderBy(desc(articles.date))
      .all()
      .map(rowToArticle);
  },
  ["articles:published"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);

const fetchDrafts = unstable_cache(
  async (language: Language): Promise<Article[]> => {
    return db
      .select()
      .from(articles)
      .where(and(eq(articles.language, language), eq(articles.draft, true)))
      .orderBy(desc(articles.date))
      .all()
      .map(rowToArticle);
  },
  ["articles:drafts"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);

const fetchOne = unstable_cache(
  async (slug: string, language: Language): Promise<Article | undefined> => {
    const row = db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.language, language)))
      .get();
    return row ? rowToArticle(row) : undefined;
  },
  ["articles:one"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);

const fetchAdjacent = unstable_cache(
  async (
    slug: string,
    language: Language,
  ): Promise<{ prev?: Article; next?: Article }> => {
    const current = db
      .select({ date: articles.date })
      .from(articles)
      .where(
        and(
          eq(articles.slug, slug),
          eq(articles.language, language),
          eq(articles.draft, false),
        ),
      )
      .get();
    if (!current) return { prev: undefined, next: undefined };

    const prevRow = db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.language, language),
          eq(articles.draft, false),
          lt(articles.date, current.date),
        ),
      )
      .orderBy(desc(articles.date))
      .limit(1)
      .get();

    const nextRow = db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.language, language),
          eq(articles.draft, false),
          gt(articles.date, current.date),
        ),
      )
      .orderBy(asc(articles.date))
      .limit(1)
      .get();

    return {
      prev: prevRow ? rowToArticle(prevRow) : undefined,
      next: nextRow ? rowToArticle(nextRow) : undefined,
    };
  },
  ["articles:adjacent"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);

export function getArticles(language: Language = DEFAULT_LANG): Promise<Article[]> {
  return fetchPublished(language);
}

export function getDraftArticles(
  language: Language = DEFAULT_LANG,
): Promise<Article[]> {
  return fetchDrafts(language);
}

export function getArticle(
  slug: string,
  language: Language = DEFAULT_LANG,
): Promise<Article | undefined> {
  return fetchOne(slug, language);
}

export function getAdjacent(slug: string, language: Language = DEFAULT_LANG) {
  return fetchAdjacent(slug, language);
}
