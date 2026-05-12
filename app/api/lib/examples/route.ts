import { NextResponse } from "next/server";

import { generateExamples } from "@/lib/mistral";

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
  if (term.length > 400) {
    return NextResponse.json({ error: "term too long" }, { status: 400 });
  }
  try {
    const examples = await generateExamples(term);
    return NextResponse.json({ ok: true, examples });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Could not generate examples";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
