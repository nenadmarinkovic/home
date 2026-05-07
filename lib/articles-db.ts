import { and, desc, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import { db } from "@/db/client";
import { articles, type ArticleRow, type Language } from "@/db/schema";
import { ARTICLES_TAG, type Article } from "@/app/writing/articles";

export type WriteArticleInput = {
  slug: string;
  language: Language;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  body: string;
  draft: boolean;
};

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

export function upsertArticle(input: WriteArticleInput) {
  const now = new Date();
  const row = db
    .insert(articles)
    .values({
      slug: input.slug,
      language: input.language,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      body: input.body,
      draft: input.draft,
      date: input.date,
      createdAt: now,
      updatedAt: now,
      exportedAt: null,
    })
    .onConflictDoUpdate({
      target: [articles.slug, articles.language],
      set: {
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        body: input.body,
        draft: input.draft,
        date: input.date,
        updatedAt: now,
        exportedAt: null,
      },
    })
    .returning()
    .get();
  revalidateTag(ARTICLES_TAG, { expire: 0 });
  return row;
}

export function deleteArticleBySlug(slug: string, language: Language) {
  const result = db
    .delete(articles)
    .where(and(eq(articles.slug, slug), eq(articles.language, language)))
    .run();
  if (result.changes > 0) revalidateTag(ARTICLES_TAG, { expire: 0 });
  return result.changes > 0;
}

export function getAdminSnapshot(language: Language = "en"): {
  published: Article[];
  drafts: Article[];
  exported: string[];
} {
  const rows = db
    .select()
    .from(articles)
    .where(eq(articles.language, language))
    .orderBy(desc(articles.date))
    .all();

  const published: Article[] = [];
  const drafts: Article[] = [];
  const exported: string[] = [];
  for (const row of rows) {
    const article = rowToArticle(row);
    if (row.draft) {
      drafts.push(article);
    } else {
      published.push(article);
      if (
        row.exportedAt &&
        row.exportedAt.getTime() >= row.updatedAt.getTime()
      ) {
        exported.push(`${row.language}:${row.slug}`);
      }
    }
  }
  return { published, drafts, exported };
}

