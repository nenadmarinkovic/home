import { NextResponse } from "next/server";
import { z } from "zod";

import { getDueStats, listReviewDeck, recordReview } from "@/lib/lib-db";
import type { Rating } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeState() {
  const deck = listReviewDeck().map(({ card, entry }) => ({
    id: card.id,
    entryId: card.entryId,
    direction: card.direction,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    learningSteps: card.learningSteps,
    lastReview: card.lastReview ? card.lastReview.getTime() : null,
    suspended: card.suspended,
    entry,
  }));
  return { deck, stats: getDueStats(), serverTime: Date.now() };
}

export async function GET() {
  return NextResponse.json({ ok: true, ...serializeState() });
}

const ReviewItem = z.object({
  cardId: z.number().int().positive(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  durationMs: z
    .number()
    .int()
    .min(0)
    .max(10 * 60 * 1000)
    .optional(),
  reviewedAt: z.number().int().positive(),
});

const BatchSchema = z.object({
  reviews: z.array(ReviewItem).max(1000),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const items = [...parsed.data.reviews].sort(
    (a, b) => a.reviewedAt - b.reviewedAt,
  );

  let applied = 0;
  const failed: { cardId: number; error: string }[] = [];
  for (const item of items) {
    try {
      recordReview({
        cardId: item.cardId,
        rating: item.rating as Rating,
        durationMs: item.durationMs,
        now: new Date(item.reviewedAt),
      });
      applied += 1;
    } catch (err) {
      failed.push({
        cardId: item.cardId,
        error: err instanceof Error ? err.message : "Review failed",
      });
    }
  }

  return NextResponse.json({ ok: true, applied, failed, ...serializeState() });
}
