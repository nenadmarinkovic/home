import { NextResponse } from "next/server";

import { translate, type TranslationDirection } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIRECTIONS: TranslationDirection[] = ["de_sr", "sr_de"];

export async function POST(request: Request) {
  let payload: { text?: unknown; direction?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = typeof payload.text === "string" ? payload.text : "";
  const direction =
    typeof payload.direction === "string" &&
    (DIRECTIONS as string[]).includes(payload.direction)
      ? (payload.direction as TranslationDirection)
      : null;
  if (!text.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }
  if (!direction) {
    return NextResponse.json(
      { error: "direction must be 'de_sr' or 'sr_de'" },
      { status: 400 },
    );
  }
  try {
    const translation = await translate(text, direction);
    return NextResponse.json({ ok: true, translation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Translate failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
