import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getGrammarSectionText,
  grammarSectionLabels,
} from "@/app/admin/vocabulary/grammar-text";
import { chatAboutGrammar } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  sectionId: z.string().min(1).max(64),
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

  const section = getGrammarSectionText(parsed.data.sectionId);
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  try {
    const reply = await chatAboutGrammar(
      {
        label: section.label,
        hint: section.hint,
        content: section.content,
        siblings: grammarSectionLabels().filter((l) => l !== section.label),
      },
      parsed.data.messages,
    );
    return NextResponse.json({ ok: true, reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
