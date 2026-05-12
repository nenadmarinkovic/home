import { NextResponse } from "next/server";
import { z } from "zod";

import { getEntryBySlug } from "@/lib/lib-db";
import { chatAboutEntry } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  slug: z.string().min(1).max(64),
  messages: z.array(MessageSchema).min(1).max(40),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const entry = getEntryBySlug(parsed.data.slug);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  try {
    const reply = await chatAboutEntry(
      {
        term: entry.term,
        pos: entry.pos,
        gender: entry.gender,
        plural: entry.plural,
        translationSr: entry.translationSr,
        examples: entry.examples,
        notes: entry.notes,
      },
      parsed.data.messages,
    );
    return NextResponse.json({ ok: true, reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
