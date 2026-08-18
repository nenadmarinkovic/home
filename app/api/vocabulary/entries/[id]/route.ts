import { NextResponse } from "next/server";

import { deleteEntry } from "@/lib/vocabulary-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/vocabulary/entries/[id]">,
) {
  const { id: idParam } = await context.params;
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const deleted = deleteEntry(id);
  return NextResponse.json({ ok: true, deleted });
}
