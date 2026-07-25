import { NextResponse } from "next/server";

import { deleteArticleBySlug, upsertArticle } from "@/lib/articles-db";
import { LANGUAGES, type Language } from "@/db/schema";

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_URL = /^\/writing\/img\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    (LANGUAGES as readonly string[]).includes(value)
  );
}

export async function POST(request: Request) {
  let payload: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    date?: string;
    body?: string;
    draft?: boolean;
    slug?: string;
    language?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = String(payload.title ?? "").trim();
  const subtitle = String(payload.subtitle ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const image = String(payload.image ?? "").trim();
  const date = String(payload.date ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const language: Language = isLanguage(payload.language)
    ? payload.language
    : "en";

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: "Body required" }, { status: 400 });
  }
  // Only an upload of ours may be the share image: the OG route reads this
  // path off disk, so anything else is either a dead link in the card or a
  // way to point the reader at a file that isn't an upload.
  if (image && !IMAGE_URL.test(image)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }
  if (!ISO_DATE.test(date)) {
    return NextResponse.json(
      { error: "Date must be ISO format (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const slug = (payload.slug && slugify(payload.slug)) || slugify(title);
  if (!slug) {
    return NextResponse.json(
      { error: "Title must contain at least one ASCII letter or digit" },
      { status: 400 },
    );
  }

  try {
    const row = upsertArticle({
      slug,
      language,
      title,
      subtitle,
      description,
      image,
      date,
      body,
      draft: Boolean(payload.draft),
    });
    return NextResponse.json({
      ok: true,
      slug: row.slug,
      language: row.language,
    });
  } catch (err: unknown) {
    // Don't echo the raw error — it can carry file paths / DB internals.
    console.error("article upsert failed", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const langParam = url.searchParams.get("language")?.trim() ?? "en";
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!isLanguage(langParam)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  try {
    const deleted = deleteArticleBySlug(slug, langParam);
    return NextResponse.json({ ok: true, deleted });
  } catch (err: unknown) {
    console.error("article delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
