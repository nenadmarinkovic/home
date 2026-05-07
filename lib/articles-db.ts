import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { articles, type Language } from "@/db/schema";

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

export function upsertArticle(input: WriteArticleInput) {
  const now = new Date();
  return db
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
}

export function deleteArticleBySlug(slug: string, language: Language) {
  const result = db
    .delete(articles)
    .where(and(eq(articles.slug, slug), eq(articles.language, language)))
    .run();
  return result.changes > 0;
}

export function countByLanguage() {
  return db
    .select({
      language: articles.language,
      total: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.language)
    .all();
}

/**
 * Keys "<lang>:<slug>" of published articles that have been exported AND
 * haven't been edited since. An article is "clean" only when exportedAt is
 * set and not older than updatedAt.
 */
export function getExportedKeys(): string[] {
  const rows = db
    .select({
      slug: articles.slug,
      language: articles.language,
    })
    .from(articles)
    .where(
      and(
        eq(articles.draft, false),
        isNotNull(articles.exportedAt),
        sql`${articles.exportedAt} >= ${articles.updatedAt}`,
      ),
    )
    .all();
  return rows.map((r) => `${r.language}:${r.slug}`);
}
