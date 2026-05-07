import { NextResponse } from "next/server";
import { deleteArticle, publishArticle } from "@/lib/github";

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  let payload: {
    title?: string;
    subtitle?: string;
    description?: string;
    date?: string;
    body?: string;
    draft?: boolean;
    slug?: string;
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
    const result = await publishArticle({
      slug,
      title,
      subtitle,
      description,
      date,
      body,
      draft: Boolean(payload.draft),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Commit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  try {
    const result = await deleteArticle(slug);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
