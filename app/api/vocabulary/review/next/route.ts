import { NextResponse } from "next/server";

import { getDueStats, getNextDueCard } from "@/lib/vocabulary-db";
import { cardFromRow, previewIntervals } from "@/lib/fsrs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getDueStats();
  const next = getNextDueCard();
  if (!next) {
    return NextResponse.json({ ok: true, stats, card: null });
  }

  const previews = previewIntervals(cardFromRow(next.card));

  return NextResponse.json({
    ok: true,
    stats,
    card: {
      id: next.card.id,
      direction: next.card.direction,
      state: next.card.state,
      reps: next.card.reps,
      due: next.card.due,
      entry: next.entry,
      previews: {
        again: previews[1].toISOString(),
        hard: previews[2].toISOString(),
        good: previews[3].toISOString(),
        easy: previews[4].toISOString(),
      },
    },
  });
}
