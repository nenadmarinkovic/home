import { NextResponse, type NextRequest } from "next/server";

import { LINK_TYPES, type LinkType } from "@/db/schema";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { upsertLinkByUrl } from "@/lib/links-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: {
    url?: unknown;
    title?: unknown;
    type?: unknown;
    note?: unknown;
    tags?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url : "";
  if (!url.trim()) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }
  const type =
    typeof body.type === "string" &&
    (LINK_TYPES as readonly string[]).includes(body.type)
      ? (body.type as LinkType)
      : undefined;
  const title = typeof body.title === "string" ? body.title : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;
  const tagSlugs = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : [];

  try {
    const saved = upsertLinkByUrl({ url, title, type, note, tagSlugs });
    return NextResponse.json(
      {
        link: {
          id: saved.id,
          url: saved.url,
          title: saved.title,
          type: saved.type,
          note: saved.note,
          createdAt:
            saved.createdAt instanceof Date
              ? saved.createdAt.toISOString()
              : String(saved.createdAt),
          tags: saved.tags.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
          })),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "save_failed" },
      { status: 400 },
    );
  }
}
