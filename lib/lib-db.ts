import { and, asc, count, desc, eq, lte, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  CARD_DIRECTIONS,
  reviewLog,
  srsCards,
  vocabEntries,
  type CardDirection,
  type NewVocabEntryRow,
  type Rating,
  type SrsCardRow,
  type VocabEntryRow,
} from "@/db/schema";
import { cardFromRow, newCard, review } from "@/lib/fsrs";

export type Example = { de: string; sr: string };

export type VocabEntry = Omit<VocabEntryRow, "examples" | "conjugations"> & {
  examples: Example[];
  conjugations: Record<string, unknown>;
};

function lemmaKey(term: string): string {
  return term
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/^(der|die|das)\s+/, "")
    .replace(/\s+/g, " ");
}

export function normalizeLemma(term: string): string {
  return lemmaKey(term);
}

function safeJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToEntry(row: VocabEntryRow): VocabEntry {
  return {
    ...row,
    examples: safeJSON<Example[]>(row.examples, []),
    conjugations: safeJSON<Record<string, unknown>>(row.conjugations, {}),
  };
}

export type WriteEntryInput = {
  term: string;
  pos: string;
  gender?: string | null;
  plural?: string | null;
  aux?: string | null;
  separable?: boolean | null;
  level?: string | null;
  translationSr: string;
  examples: Example[];
  conjugations: Record<string, unknown>;
  notes?: string;
  tags?: string;
  source?: string;
  // When provided, update this row (and re-key its lemma); otherwise insert.
  id?: number;
};

export type UpsertEntryResult = {
  entry: VocabEntry;
  created: boolean;
};

/**
 * Insert or update an entry, then ensure the two SRS cards (de_sr, sr_de) exist.
 * Lemma uniqueness is `(lemma, pos)`; collisions update in place.
 */
export function saveEntry(input: WriteEntryInput): UpsertEntryResult {
  const now = new Date();
  const lemma = lemmaKey(input.term);
  const examplesJson = JSON.stringify(input.examples ?? []);
  const conjugationsJson = JSON.stringify(input.conjugations ?? {});

  const values: NewVocabEntryRow = {
    term: input.term.trim(),
    lemma,
    pos: input.pos,
    gender: input.gender ?? null,
    plural: input.plural ?? null,
    aux: input.aux ?? null,
    separable: input.separable ?? null,
    level: input.level ?? null,
    translationSr: input.translationSr.trim(),
    examples: examplesJson,
    conjugations: conjugationsJson,
    notes: input.notes ?? "",
    tags: (input.tags ?? "").trim().toLowerCase(),
    source: input.source ?? "manual",
    createdAt: now,
    updatedAt: now,
  };

  let row: VocabEntryRow;
  let created = false;

  if (input.id !== undefined) {
    row = db
      .update(vocabEntries)
      .set({
        term: values.term,
        lemma: values.lemma,
        pos: values.pos,
        gender: values.gender,
        plural: values.plural,
        aux: values.aux,
        separable: values.separable,
        level: values.level,
        translationSr: values.translationSr,
        examples: values.examples,
        conjugations: values.conjugations,
        notes: values.notes,
        tags: values.tags,
        source: values.source,
        updatedAt: now,
      })
      .where(eq(vocabEntries.id, input.id))
      .returning()
      .get();
  } else {
    const inserted = db
      .insert(vocabEntries)
      .values(values)
      .onConflictDoUpdate({
        target: [vocabEntries.lemma, vocabEntries.pos],
        set: {
          term: values.term,
          gender: values.gender,
          plural: values.plural,
          aux: values.aux,
          separable: values.separable,
          level: values.level,
          translationSr: values.translationSr,
          examples: values.examples,
          conjugations: values.conjugations,
          notes: values.notes,
          tags: values.tags,
          source: values.source,
          updatedAt: now,
        },
      })
      .returning()
      .get();
    row = inserted;
    created = inserted.createdAt.getTime() === inserted.updatedAt.getTime();
  }

  ensureCards(row.id, now);
  return { entry: rowToEntry(row), created };
}

function ensureCards(entryId: number, now: Date) {
  const empty = newCard(now);
  for (const direction of CARD_DIRECTIONS) {
    db.insert(srsCards)
      .values({
        entryId,
        direction,
        due: empty.due,
        stability: empty.stability,
        difficulty: empty.difficulty,
        elapsedDays: empty.elapsed_days,
        scheduledDays: empty.scheduled_days,
        reps: empty.reps,
        lapses: empty.lapses,
        state: empty.state,
        learningSteps: empty.learning_steps,
        lastReview: empty.last_review ?? null,
        suspended: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({
        target: [srsCards.entryId, srsCards.direction],
      })
      .run();
  }
}

export function deleteEntry(id: number): boolean {
  const res = db.delete(vocabEntries).where(eq(vocabEntries.id, id)).run();
  return res.changes > 0;
}

export function getEntryById(id: number): VocabEntry | null {
  const row = db
    .select()
    .from(vocabEntries)
    .where(eq(vocabEntries.id, id))
    .get();
  return row ? rowToEntry(row) : null;
}

export type EntryListItem = VocabEntry & {
  due: number;
  reviewed: number;
};

export function listEntries(options?: {
  search?: string;
  limit?: number;
}): EntryListItem[] {
  const limit = options?.limit ?? 500;
  const q = options?.search?.trim().toLowerCase() ?? "";
  const baseRows = q
    ? db
        .select()
        .from(vocabEntries)
        .where(
          or(
            sql`lower(${vocabEntries.term}) like ${`%${q}%`}`,
            sql`lower(${vocabEntries.translationSr}) like ${`%${q}%`}`,
            sql`lower(${vocabEntries.tags}) like ${`%${q}%`}`,
          ),
        )
        .orderBy(desc(vocabEntries.createdAt))
        .limit(limit)
        .all()
    : db
        .select()
        .from(vocabEntries)
        .orderBy(desc(vocabEntries.createdAt))
        .limit(limit)
        .all();

  if (baseRows.length === 0) return [];
  const ids = baseRows.map((r) => r.id);
  const now = new Date();

  const dueRows = db
    .select({
      entryId: srsCards.entryId,
      due: count(srsCards.id),
    })
    .from(srsCards)
    .where(
      and(
        eq(srsCards.suspended, false),
        lte(srsCards.due, now),
        sql`${srsCards.entryId} in (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      ),
    )
    .groupBy(srsCards.entryId)
    .all();

  const reviewedRows = db
    .select({
      entryId: srsCards.entryId,
      reviewed: count(srsCards.id),
    })
    .from(srsCards)
    .where(
      and(
        sql`${srsCards.reps} > 0`,
        sql`${srsCards.entryId} in (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      ),
    )
    .groupBy(srsCards.entryId)
    .all();

  const dueByEntry = new Map(dueRows.map((r) => [r.entryId, Number(r.due)]));
  const reviewedByEntry = new Map(
    reviewedRows.map((r) => [r.entryId, Number(r.reviewed)]),
  );

  return baseRows.map((r) => ({
    ...rowToEntry(r),
    due: dueByEntry.get(r.id) ?? 0,
    reviewed: reviewedByEntry.get(r.id) ?? 0,
  }));
}

export type DueCard = {
  card: SrsCardRow;
  entry: VocabEntry;
};

export type DueStats = {
  due: number;
  newCards: number;
  total: number;
};

export function getDueStats(now: Date = new Date()): DueStats {
  const dueRow = db
    .select({ n: count(srsCards.id) })
    .from(srsCards)
    .where(and(eq(srsCards.suspended, false), lte(srsCards.due, now)))
    .get();
  const newRow = db
    .select({ n: count(srsCards.id) })
    .from(srsCards)
    .where(and(eq(srsCards.suspended, false), eq(srsCards.state, 0)))
    .get();
  const totalRow = db
    .select({ n: count(srsCards.id) })
    .from(srsCards)
    .where(eq(srsCards.suspended, false))
    .get();
  return {
    due: Number(dueRow?.n ?? 0),
    newCards: Number(newRow?.n ?? 0),
    total: Number(totalRow?.n ?? 0),
  };
}

/**
 * Pick the next card to review. Order: cards in learning/relearning that are
 * past due first (state=1 or 3), then review-state cards that are past due,
 * then new cards. Within each bucket, oldest due first.
 */
export function getNextDueCard(now: Date = new Date()): DueCard | null {
  const card = db
    .select()
    .from(srsCards)
    .where(
      and(
        eq(srsCards.suspended, false),
        or(
          and(
            sql`${srsCards.state} in (1, 3)`,
            lte(srsCards.due, now),
          ),
          and(
            eq(srsCards.state, 2),
            lte(srsCards.due, now),
          ),
          eq(srsCards.state, 0),
        ),
      ),
    )
    .orderBy(
      sql`case ${srsCards.state} when 1 then 0 when 3 then 0 when 2 then 1 else 2 end`,
      asc(srsCards.due),
    )
    .limit(1)
    .get();

  if (!card) return null;
  const entryRow = db
    .select()
    .from(vocabEntries)
    .where(eq(vocabEntries.id, card.entryId))
    .get();
  if (!entryRow) return null;
  return { card, entry: rowToEntry(entryRow) };
}

export type RecordReviewInput = {
  cardId: number;
  rating: Rating;
  durationMs?: number;
  now?: Date;
};

export function recordReview(input: RecordReviewInput): SrsCardRow {
  const now = input.now ?? new Date();
  const cardRow = db
    .select()
    .from(srsCards)
    .where(eq(srsCards.id, input.cardId))
    .get();
  if (!cardRow) {
    throw new Error(`Card ${input.cardId} not found`);
  }

  const result = review(cardFromRow(cardRow), input.rating, now);

  const updated = db
    .update(srsCards)
    .set({
      due: result.card.due,
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      elapsedDays: result.card.elapsed_days,
      scheduledDays: result.card.scheduled_days,
      reps: result.card.reps,
      lapses: result.card.lapses,
      state: result.card.state,
      learningSteps: result.card.learning_steps,
      lastReview: result.card.last_review ?? null,
      updatedAt: now,
    })
    .where(eq(srsCards.id, input.cardId))
    .returning()
    .get();

  db.insert(reviewLog)
    .values({
      cardId: input.cardId,
      rating: result.log.rating,
      state: result.log.state,
      due: result.log.due,
      stability: result.log.stability,
      difficulty: result.log.difficulty,
      elapsedDays: result.log.elapsed_days,
      lastElapsedDays: result.log.last_elapsed_days,
      scheduledDays: result.log.scheduled_days,
      learningSteps: result.log.learning_steps,
      review: result.log.review,
      durationMs: input.durationMs ?? 0,
    })
    .run();

  return updated;
}

export function setCardSuspended(
  cardId: number,
  suspended: boolean,
): SrsCardRow | null {
  const updated = db
    .update(srsCards)
    .set({ suspended, updatedAt: new Date() })
    .where(eq(srsCards.id, cardId))
    .returning()
    .get();
  return updated ?? null;
}

export function listCardsForEntry(entryId: number): SrsCardRow[] {
  return db
    .select()
    .from(srsCards)
    .where(eq(srsCards.entryId, entryId))
    .orderBy(asc(srsCards.direction))
    .all();
}

export function directionsForEntry(): readonly CardDirection[] {
  return CARD_DIRECTIONS;
}
