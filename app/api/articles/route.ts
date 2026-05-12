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
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
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
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
