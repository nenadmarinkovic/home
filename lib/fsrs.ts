import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating as FsrsRating,
  type Card as FsrsCard,
  type Grade,
  type ReviewLog as FsrsReviewLog,
} from "ts-fsrs";

import type { Rating, SrsCardRow } from "@/db/schema";

const scheduler = fsrs(generatorParameters());

export type SchedulerCard = FsrsCard;
export type SchedulerLog = FsrsReviewLog;

export { FsrsRating };

export function newCard(now: Date = new Date()): SchedulerCard {
  return createEmptyCard(now);
}

export function cardFromRow(
  row: Pick<
    SrsCardRow,
    | "due"
    | "stability"
    | "difficulty"
    | "elapsedDays"
    | "scheduledDays"
    | "reps"
    | "lapses"
    | "state"
    | "learningSteps"
    | "lastReview"
  >,
): SchedulerCard {
  return {
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsedDays,
    scheduled_days: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as SchedulerCard["state"],
    learning_steps: row.learningSteps,
    last_review: row.lastReview ?? undefined,
  };
}

export type ReviewResult = {
  card: SchedulerCard;
  log: SchedulerLog;
};

export function review(
  card: SchedulerCard,
  rating: Rating,
  now: Date = new Date(),
): ReviewResult {
  return scheduler.next(card, now, rating as unknown as Grade);
}

export function previewIntervals(
  card: SchedulerCard,
  now: Date = new Date(),
): Record<Rating, Date> {
  const out = scheduler.repeat(card, now);
  return {
    1: out[FsrsRating.Again].card.due,
    2: out[FsrsRating.Hard].card.due,
    3: out[FsrsRating.Good].card.due,
    4: out[FsrsRating.Easy].card.due,
  };
}
