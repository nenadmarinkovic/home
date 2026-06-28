// Client-side offline store for the vocab review deck.
//
// The server's SQLite lives behind `better-sqlite3`, which can't run in the
// browser — so to review offline on a phone we mirror the deck into IndexedDB
// and schedule cards with the same `ts-fsrs` code the server uses. Reviews are
// queued locally and flushed back to the server on reconnect. The server stays
// the source of truth; this is a synced cache.
//
// Browser-only: import this from "use client" modules. Every entry point guards
// on `indexedDB` being defined so it's a no-op if it somehow runs server-side.

import { cardFromRow, previewIntervals, review } from "@/lib/fsrs";
import type { CardDirection, Rating } from "@/db/schema";
import type { EntryListItem, VocabEntry } from "@/lib/lib-db";

export type OfflineCard = {
  id: number;
  entryId: number;
  direction: CardDirection;
  due: number; // epoch ms
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  learningSteps: number;
  lastReview: number | null; // epoch ms
  suspended: boolean;
  entry: VocabEntry;
};

export type QueuedReview = {
  cardId: number;
  rating: Rating;
  durationMs: number;
  reviewedAt: number; // epoch ms
};

export type StoredReview = QueuedReview & { qid: number };

export type DeckStats = {
  due: number;
  newCards: number;
  total: number;
};

const DB_NAME = "lib-offline";
const DB_VERSION = 1;
const STORE_CARDS = "cards";
const STORE_QUEUE = "queue";

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: "qid", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// --- Deck storage ----------------------------------------------------------

export async function getDeck(): Promise<OfflineCard[]> {
  if (!hasIndexedDb()) return [];
  const db = await openDb();
  try {
    const cards = await requestToPromise(
      db.transaction(STORE_CARDS, "readonly").objectStore(STORE_CARDS).getAll(),
    );
    return cards as OfflineCard[];
  } finally {
    db.close();
  }
}

export async function replaceDeck(cards: OfflineCard[]): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    const store = tx.objectStore(STORE_CARDS);
    store.clear();
    for (const card of cards) store.put(card);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function putCard(card: OfflineCard): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.objectStore(STORE_CARDS).put(card);
    await txDone(tx);
  } finally {
    db.close();
  }
}

// --- Review queue ----------------------------------------------------------

export async function enqueueReview(item: QueuedReview): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    tx.objectStore(STORE_QUEUE).add(item);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function getQueue(): Promise<StoredReview[]> {
  if (!hasIndexedDb()) return [];
  const db = await openDb();
  try {
    const rows = await requestToPromise(
      db.transaction(STORE_QUEUE, "readonly").objectStore(STORE_QUEUE).getAll(),
    );
    return rows as StoredReview[];
  } finally {
    db.close();
  }
}

export async function clearQueue(qids: number[]): Promise<void> {
  if (!hasIndexedDb() || qids.length === 0) return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    for (const qid of qids) store.delete(qid);
    await txDone(tx);
  } finally {
    db.close();
  }
}

// --- Server sync -----------------------------------------------------------

const SYNC_URL = "/api/lib/review/sync";

// Pull the authoritative deck from the server and mirror it locally. Called
// when online (from either the lib list or the review screen) so the offline
// copy — the word DB and the review deck both read from it — stays current
// without the user having to open the review screen first. Returns null when
// offline or the request fails; callers fall back to whatever's already stored.
export async function refreshDeck(): Promise<OfflineCard[] | null> {
  if (!hasIndexedDb()) return null;
  try {
    const res = await fetch(SYNC_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; deck?: OfflineCard[] };
    if (!data.ok || !data.deck) return null;
    await replaceDeck(data.deck);
    return data.deck;
  } catch {
    return null;
  }
}

// Collapse the card-level deck back into the entry list the lib page renders.
// Each entry has two cards (DE→SR and SR→DE); we keep one row per entry and
// fold the per-card due/reviewed counts into it, mirroring `listEntries`.
export function entriesFromDeck(
  deck: OfflineCard[],
  now: Date,
): EntryListItem[] {
  const nowMs = now.getTime();
  const byId = new Map<number, EntryListItem>();
  for (const card of deck) {
    if (card.suspended) continue;
    let row = byId.get(card.entryId);
    if (!row) {
      row = { ...card.entry, due: 0, reviewed: 0 };
      byId.set(card.entryId, row);
    }
    if (card.due <= nowMs) row.due += 1;
    if (card.reps > 0) row.reviewed += 1;
  }
  return Array.from(byId.values());
}

// --- Scheduling (pure, no storage) -----------------------------------------

function toSchedulerCard(card: OfflineCard) {
  return cardFromRow({
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    learningSteps: card.learningSteps,
    lastReview: card.lastReview != null ? new Date(card.lastReview) : null,
  });
}

/** Apply a rating client-side, returning the card with its next FSRS state. */
export function applyReview(
  card: OfflineCard,
  rating: Rating,
  now: Date,
): OfflineCard {
  const { card: next } = review(toSchedulerCard(card), rating, now);
  return {
    ...card,
    due: next.due.getTime(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays: next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state,
    learningSteps: next.learning_steps,
    lastReview: next.last_review ? next.last_review.getTime() : null,
  };
}

/** Next-due-card selection, mirroring `getNextDueCard` in lib-db. */
export function pickNextCard(
  deck: OfflineCard[],
  now: Date,
): OfflineCard | null {
  const nowMs = now.getTime();
  const candidates = deck.filter(
    (c) => !c.suspended && (c.state === 0 || c.due <= nowMs),
  );
  if (candidates.length === 0) return null;
  // Learning/relearning (1, 3) first, then review (2), then new (0); oldest due
  // within each bucket.
  const bucket = (c: OfflineCard) =>
    c.state === 1 || c.state === 3 ? 0 : c.state === 2 ? 1 : 2;
  candidates.sort((a, b) => bucket(a) - bucket(b) || a.due - b.due);
  return candidates[0];
}

/** Due / new / total counts, mirroring `getDueStats` in lib-db. */
export function computeStats(deck: OfflineCard[], now: Date): DeckStats {
  const nowMs = now.getTime();
  let due = 0;
  let newCards = 0;
  let total = 0;
  for (const card of deck) {
    if (card.suspended) continue;
    total += 1;
    if (card.due <= nowMs) due += 1;
    if (card.state === 0) newCards += 1;
  }
  return { due, newCards, total };
}

/** Per-rating next due dates, for labelling the rating buttons. */
export function previewsFor(
  card: OfflineCard,
  now: Date,
): Record<Rating, Date> {
  return previewIntervals(toSchedulerCard(card), now);
}
