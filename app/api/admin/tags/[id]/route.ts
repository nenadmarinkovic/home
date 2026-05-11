import { NextResponse, type NextRequest } from "next/server";

import { getAuthedFromCookie } from "@/lib/auth-server";
import { deleteTag, renameTag } from "@/lib/links-db";

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

  let body: { name?: unknown };
  try {
    body = (await req.json()) as { name?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  try {
    const tag = renameTag(id, name);
    if (!tag) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ tag });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "rename_failed" },
      { status: 400 },
    );
  }
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
  const ok = deleteTag(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
