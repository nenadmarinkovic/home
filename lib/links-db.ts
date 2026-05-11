import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  linkTags,
  links,
  tags,
  type LinkRow,
  type LinkType,
  type TagRow,
} from "@/db/schema";
import { deriveType, normalizeUrl, slugify } from "./url-utils";

export const PUBLIC_TAG_SLUG = "public";
export const ACCESS_TAG_SLUGS = new Set([PUBLIC_TAG_SLUG]);

export type LinkWithTags = LinkRow & { tags: TagRow[] };

export function listTags(): TagRow[] {
  return db.select().from(tags).orderBy(tags.name).all();
}

export function findTagBySlug(slug: string): TagRow | undefined {
  return db.select().from(tags).where(eq(tags.slug, slug)).get();
}

export function findTagById(id: number): TagRow | undefined {
  return db.select().from(tags).where(eq(tags.id, id)).get();
}

export function createTag(name: string): TagRow {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");
  const slug = slugify(trimmed);
  if (!slug) throw new Error("Tag name must contain at least one letter or digit");
  const existing = findTagBySlug(slug);
  if (existing) return existing;
  return db.insert(tags).values({ slug, name: trimmed }).returning().get();
}

export function renameTag(id: number, name: string): TagRow | null {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");
  const slug = slugify(trimmed);
  if (!slug) throw new Error("Tag name must contain at least one letter or digit");
  const clash = findTagBySlug(slug);
  if (clash && clash.id !== id) throw new Error("Another tag already uses that name");
  return (
    db
      .update(tags)
      .set({ slug, name: trimmed })
      .where(eq(tags.id, id))
      .returning()
      .get() ?? null
  );
}

export function deleteTag(id: number): boolean {
  const res = db.delete(tags).where(eq(tags.id, id)).run();
  return res.changes > 0;
}

function ensureTagsBySlug(slugs: string[]): TagRow[] {
  const unique = Array.from(new Set(slugs.map((s) => slugify(s)).filter(Boolean)));
  if (unique.length === 0) return [];
  const existing = db
    .select()
    .from(tags)
    .where(inArray(tags.slug, unique))
    .all();
  const have = new Set(existing.map((t) => t.slug));
  const missing = unique.filter((s) => !have.has(s));
  for (const slug of missing) {
    const created = db
      .insert(tags)
      .values({ slug, name: slug })
      .returning()
      .get();
    existing.push(created);
  }
  return existing;
}

function tagsForLink(linkId: number): TagRow[] {
  return db
    .select({
      id: tags.id,
      slug: tags.slug,
      name: tags.name,
      createdAt: tags.createdAt,
    })
    .from(linkTags)
    .innerJoin(tags, eq(linkTags.tagId, tags.id))
    .where(eq(linkTags.linkId, linkId))
    .orderBy(tags.name)
    .all();
}

function attachTags(rows: LinkRow[]): LinkWithTags[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const pairs = db
    .select({
      linkId: linkTags.linkId,
      tag: tags,
    })
    .from(linkTags)
    .innerJoin(tags, eq(linkTags.tagId, tags.id))
    .where(inArray(linkTags.linkId, ids))
    .orderBy(tags.name)
    .all();
  const byLink = new Map<number, TagRow[]>();
  for (const { linkId, tag } of pairs) {
    const list = byLink.get(linkId) ?? [];
    list.push(tag);
    byLink.set(linkId, list);
  }
  return rows.map((r) => ({ ...r, tags: byLink.get(r.id) ?? [] }));
}

export type ListLinkOptions = {
  publicOnly?: boolean;
  tagSlugs?: string[];
  limit?: number;
};

export function listLinks(options: ListLinkOptions = {}): LinkWithTags[] {
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 1000);
  const requiredSlugs = (options.tagSlugs ?? [])
    .map((s) => slugify(s))
    .filter(Boolean);
  const effectiveSlugs = options.publicOnly
    ? Array.from(new Set([...requiredSlugs, PUBLIC_TAG_SLUG]))
    : requiredSlugs;

  let rows: LinkRow[];
  if (effectiveSlugs.length === 0) {
    rows = db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .all();
  } else {
    // Pick links that have every required tag. Done with a grouped subquery.
    const matchingIds = db
      .select({ linkId: linkTags.linkId })
      .from(linkTags)
      .innerJoin(tags, eq(linkTags.tagId, tags.id))
      .where(inArray(tags.slug, effectiveSlugs))
      .groupBy(linkTags.linkId)
      .having(sql`COUNT(DISTINCT ${tags.slug}) = ${effectiveSlugs.length}`)
      .all()
      .map((r) => r.linkId);
    if (matchingIds.length === 0) return [];
    rows = db
      .select()
      .from(links)
      .where(inArray(links.id, matchingIds))
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .all();
  }
  return attachTags(rows);
}

export function getLinkById(id: number): LinkWithTags | null {
  const row = db.select().from(links).where(eq(links.id, id)).get();
  if (!row) return null;
  return { ...row, tags: tagsForLink(row.id) };
}

export type UpsertLinkInput = {
  url: string;
  title?: string;
  type?: LinkType;
  note?: string;
  tagSlugs?: string[];
  /** When true, replace tags entirely; otherwise tags are added to existing. */
  replaceTags?: boolean;
};

export function upsertLinkByUrl(input: UpsertLinkInput): LinkWithTags {
  const url = normalizeUrl(input.url);
  if (!url) throw new Error("URL is required");
  const type = input.type ?? deriveType(url);
  const title = (input.title ?? "").trim();
  const note = (input.note ?? "").trim();

  const existing = db.select().from(links).where(eq(links.url, url)).get();
  let row: LinkRow;
  if (existing) {
    row = db
      .update(links)
      .set({
        title: title || existing.title,
        type,
        note: note || existing.note,
        updatedAt: new Date(),
      })
      .where(eq(links.id, existing.id))
      .returning()
      .get();
  } else {
    row = db
      .insert(links)
      .values({ url, title, type, note })
      .returning()
      .get();
  }

  const tagRows = ensureTagsBySlug(input.tagSlugs ?? []);
  if (input.replaceTags) {
    db.delete(linkTags).where(eq(linkTags.linkId, row.id)).run();
  }
  for (const tag of tagRows) {
    db.insert(linkTags)
      .values({ linkId: row.id, tagId: tag.id })
      .onConflictDoNothing()
      .run();
  }

  return { ...row, tags: tagsForLink(row.id) };
}

export type UpdateLinkInput = {
  title?: string;
  type?: LinkType;
  note?: string;
  tagSlugs?: string[];
};

export function updateLink(id: number, patch: UpdateLinkInput): LinkWithTags | null {
  const existing = db.select().from(links).where(eq(links.id, id)).get();
  if (!existing) return null;
  const updated = db
    .update(links)
    .set({
      title: patch.title?.trim() ?? existing.title,
      type: patch.type ?? (existing.type as LinkType),
      note: patch.note?.trim() ?? existing.note,
      updatedAt: new Date(),
    })
    .where(eq(links.id, id))
    .returning()
    .get();

  if (patch.tagSlugs) {
    const tagRows = ensureTagsBySlug(patch.tagSlugs);
    db.delete(linkTags).where(eq(linkTags.linkId, id)).run();
    for (const tag of tagRows) {
      db.insert(linkTags)
        .values({ linkId: id, tagId: tag.id })
        .onConflictDoNothing()
        .run();
    }
  }

  return { ...updated, tags: tagsForLink(id) };
}

export function deleteLink(id: number): boolean {
  const res = db.delete(links).where(eq(links.id, id)).run();
  return res.changes > 0;
}

export function listTagsWithCounts(): Array<TagRow & { count: number }> {
  const rows = db
    .select({
      id: tags.id,
      slug: tags.slug,
      name: tags.name,
      createdAt: tags.createdAt,
      count: sql<number>`COUNT(${linkTags.linkId})`,
    })
    .from(tags)
    .leftJoin(linkTags, eq(linkTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(tags.name)
    .all();
  return rows.map((r) => ({ ...r, count: Number(r.count ?? 0) }));
}
