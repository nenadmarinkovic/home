import { startOfDay } from "@/lib/daily";

export const NEW_EVERY = 5;
export const NEW_PER_DAY = 6;
export const FOCUS_WORDS = 10;

export type QueueCard = {
  id: number;
  entryId: number;
  state: number;
  due: number;
  suspended: boolean;
};

export type PickContext = {
  doneToday: number;
  lastEntryId: number | null;
};

export const FRESH_START: PickContext = { doneToday: 0, lastEntryId: null };

function scramble(value: number, seed: number): number {
  let x = (Math.imul(value, 2654435761) + Math.imul(seed, 40503)) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822507) >>> 0;
  x ^= x >>> 13;
  return x >>> 0;
}

function daySeed(now: Date): number {
  return Math.round(startOfDay(now).getTime() / 86_400_000);
}

function focusWords(backlog: QueueCard[], seed: number): Set<number> {
  const words = [...new Set(backlog.map((card) => card.entryId))];
  if (words.length <= FOCUS_WORDS) return new Set(words);
  words.sort((a, b) => scramble(a, seed) - scramble(b, seed));
  return new Set(words.slice(0, FOCUS_WORDS));
}

function apartFromLast<T extends QueueCard>(
  pool: T[],
  lastEntryId: number | null,
): T[] {
  if (lastEntryId === null) return pool;
  const others = pool.filter((card) => card.entryId !== lastEntryId);
  return others.length > 0 ? others : pool;
}

export function pickFromDeck<T extends QueueCard>(
  cards: T[],
  now: Date,
  context: PickContext = FRESH_START,
): T | null {
  const nowMs = now.getTime();
  const ready = cards.filter(
    (card) => !card.suspended && (card.state === 0 || card.due <= nowMs),
  );
  if (ready.length === 0) return null;

  const seed = daySeed(now);
  const backlog = ready.filter((card) => card.state === 1 || card.state === 3);
  const focus = focusWords(backlog, seed);
  const learning = backlog.filter((card) => focus.has(card.entryId));
  const due = ready.filter((card) => card.state === 2);
  const fresh = ready.filter((card) => card.state === 0);

  const wantNew =
    fresh.length > 0 &&
    context.doneToday % NEW_EVERY === NEW_EVERY - 1 &&
    Math.floor(context.doneToday / NEW_EVERY) < NEW_PER_DAY;

  for (const pool of wantNew
    ? [fresh, learning, due]
    : [learning, due, fresh]) {
    if (pool.length === 0) continue;
    const choices = apartFromLast(pool, context.lastEntryId);
    if (pool === fresh) {
      return choices.reduce((best, card) =>
        scramble(card.id, seed) < scramble(best.id, seed) ? card : best,
      );
    }
    return choices[Math.floor(Math.random() * choices.length)];
  }
  return null;
}
