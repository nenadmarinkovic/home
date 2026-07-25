import { and, desc, eq, like, ne, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import { db } from "@/db/client";
import { articles, type ArticleRow, type Language } from "@/db/schema";
import { ARTICLES_TAG, type Article } from "@/app/writing/articles";
import { deleteImageByUrl, extractImageUrls } from "@/lib/uploads";

export type WriteArticleInput = {
  slug: string;
  language: Language;
  title: string;
  subtitle: string;
  description: string;
  image: string;
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
    image: row.image,
    body: row.body,
    draft: row.draft,
    date: row.date,
    dateLabel: dateLabelFor(row.date),
  };
}

function isImageUrlUsedElsewhere(
  url: string,
  excludeSlug: string,
  excludeLanguage: Language,
): boolean {
  const row = db
    .select({ n: sql<number>`count(*)` })
    .from(articles)
    .where(
      and(
        // Referenced either from a body or as another post's share image.
        or(like(articles.body, `%${url}%`), eq(articles.image, url)),
        or(
          ne(articles.slug, excludeSlug),
          ne(articles.language, excludeLanguage),
        ),
      ),
    )
    .get();
  return (row?.n ?? 0) > 0;
}

async function cleanupOrphanedImages(
  urls: string[],
  ownerSlug: string,
  ownerLanguage: Language,
) {
  for (const url of urls) {
    if (isImageUrlUsedElsewhere(url, ownerSlug, ownerLanguage)) continue;
    await deleteImageByUrl(url);
  }
}

export function upsertArticle(input: WriteArticleInput) {
  const previous = db
    .select({ body: articles.body, image: articles.image })
    .from(articles)
    .where(
      and(
        eq(articles.slug, input.slug),
        eq(articles.language, input.language),
      ),
    )
    .get();

  const now = new Date();
  const row = db
    .insert(articles)
    .values({
      slug: input.slug,
      language: input.language,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      image: input.image,
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
        image: input.image,
        body: input.body,
        draft: input.draft,
        date: input.date,
        updatedAt: now,
        exportedAt: null,
      },
    })
    .returning()
    .get();

  if (previous) {
    // The share image is tracked alongside the body's images: swapping or
    // clearing it leaves the old upload on disk otherwise.
    const oldUrls = new Set(extractImageUrls(previous.body));
    if (previous.image) oldUrls.add(previous.image);
    const newUrls = new Set(extractImageUrls(input.body));
    if (input.image) newUrls.add(input.image);
    const orphans = [...oldUrls].filter((u) => !newUrls.has(u));
    if (orphans.length > 0) {
      void cleanupOrphanedImages(orphans, input.slug, input.language);
    }
  }

  revalidateTag(ARTICLES_TAG, { expire: 0 });
  return row;
}

export function deleteArticleBySlug(slug: string, language: Language) {
  const existing = db
    .select({ body: articles.body, image: articles.image })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.language, language)))
    .get();

  const result = db
    .delete(articles)
    .where(and(eq(articles.slug, slug), eq(articles.language, language)))
    .run();

  if (result.changes > 0) {
    if (existing) {
      const urls = extractImageUrls(existing.body);
      if (existing.image) urls.push(existing.image);
      if (urls.length > 0) {
        void cleanupOrphanedImages(urls, slug, language);
      }
    }
    revalidateTag(ARTICLES_TAG, { expire: 0 });
  }
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

