import { NextResponse } from "next/server";
import { z } from "zod";

import { recordReview } from "@/lib/vocabulary-db";
import type { Rating } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SubmitSchema = z.object({
  cardId: z.number().int().positive(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  durationMs: z.number().int().min(0).max(10 * 60 * 1000).optional(),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = SubmitSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  try {
    const card = recordReview({
      cardId: parsed.data.cardId,
      rating: parsed.data.rating as Rating,
      durationMs: parsed.data.durationMs,
    });
    return NextResponse.json({
      ok: true,
      card: {
        id: card.id,
        due: card.due,
        state: card.state,
        reps: card.reps,
        lapses: card.lapses,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
