import { NextResponse, type NextRequest } from "next/server";

import { LINK_TYPES, type LinkType } from "@/db/schema";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { deleteLink, updateLink } from "@/lib/links-db";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  let body: {
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
  const title = typeof body.title === "string" ? body.title : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;
  const type =
    typeof body.type === "string" &&
    (LINK_TYPES as readonly string[]).includes(body.type)
      ? (body.type as LinkType)
      : undefined;
  const tagSlugs = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : undefined;

  const updated = updateLink(id, { title, type, note, tagSlugs });
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ link: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  const ok = deleteLink(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
