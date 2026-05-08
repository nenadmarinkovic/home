import { NextResponse } from "next/server";

import { enrichTerm } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: { term?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const term = typeof payload.term === "string" ? payload.term.trim() : "";
  if (!term) {
    return NextResponse.json({ error: "term required" }, { status: 400 });
  }
  if (term.length > 200) {
    return NextResponse.json({ error: "term too long" }, { status: 400 });
  }
  try {
    const entry = await enrichTerm(term);
    return NextResponse.json({ ok: true, entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Enrich failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
