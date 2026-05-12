import { NextResponse, type NextRequest } from "next/server";

import { LINK_TYPES, type LinkType } from "@/db/schema";
import { readBearerToken, verifyApiToken } from "@/lib/api-token";
import { listLinks, upsertLinkByUrl } from "@/lib/links-db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tagsParam = url.searchParams.get("tags");
  const tagSlugs = tagsParam
    ? tagsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw
    ? Math.max(1, Math.min(Number(limitRaw) || 100, 500))
    : 100;

  const rows = listLinks({ publicOnly: true, tagSlugs, limit });
  const links = rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    type: r.type,
    note: r.note,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    tags: r.tags.map((t) => ({ slug: t.slug, name: t.name })),
  }));
  return NextResponse.json({ links }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const token = readBearerToken(req.headers.get("authorization"));
  if (!verifyApiToken(token)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const payload = body as {
    url?: unknown;
    title?: unknown;
    type?: unknown;
    note?: unknown;
    tags?: unknown;
  };
  const url = typeof payload.url === "string" ? payload.url : "";
  if (!url) {
    return NextResponse.json(
      { error: "url_required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  const type =
    typeof payload.type === "string" &&
    (LINK_TYPES as readonly string[]).includes(payload.type)
      ? (payload.type as LinkType)
      : undefined;
  const title = typeof payload.title === "string" ? payload.title : undefined;
  const note = typeof payload.note === "string" ? payload.note : undefined;
  const tagSlugs = Array.isArray(payload.tags)
    ? payload.tags.filter((t): t is string => typeof t === "string")
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
          tags: saved.tags.map((t) => ({ slug: t.slug, name: t.name })),
        },
      },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "save_failed" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
