import type { Metadata } from "next";

import { getDueStats, getNextDueCard } from "@/lib/lib-db";
import { cardFromRow, previewIntervals } from "@/lib/fsrs";
import { ReviewClient, type CardPayload } from "./review-client";

export const metadata: Metadata = {
  title: "Review · Lib · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  const stats = getDueStats();
  const next = getNextDueCard();
  let initialCard: CardPayload | null = null;
  if (next) {
    const previews = previewIntervals(cardFromRow(next.card));
    initialCard = {
      id: next.card.id,
      direction: next.card.direction as CardPayload["direction"],
      state: next.card.state,
      reps: next.card.reps,
      due: next.card.due.toISOString(),
      entry: next.entry,
      previews: {
        again: previews[1].toISOString(),
        hard: previews[2].toISOString(),
        good: previews[3].toISOString(),
        easy: previews[4].toISOString(),
      },
    };
  }
  return <ReviewClient initialCard={initialCard} initialStats={stats} />;
}
