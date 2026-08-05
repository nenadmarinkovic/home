// Merge rules for `npm run db:sync`. Kept separate from the transport so the
// merge can be exercised without touching production.

import { newCard, review } from "../lib/fsrs";
import type { Rating } from "../db/schema";

export type Row = Record<string, unknown>;

export type Dataset = {
  articles: Row[];
  tags: Row[];
  links: Row[];
  linkTags: Row[];
  vocab: Row[];
  cards: Row[];
  reviews: Row[];
  settings: Row[];
};

const SEP = " ";
export const key = (...parts: unknown[]) => parts.join(SEP);
const num = (value: unknown) => (typeof value === "number" ? value : 0);

export type MergeStat = {
  rows: Row[];
  fromLive: number;
  fromLocal: number;
  added: number;
};

// Keep whichever side touched the row last. `stamp` names the column that says
// when that was; without one, the first side wins and the other is ignored.
export function mergeBy(
  local: Row[],
  live: Row[],
  keyOf: (row: Row) => string,
  stamp: string | null,
): MergeStat {
  const merged = new Map<string, Row>();
  let fromLive = 0;
  let fromLocal = 0;
  let added = 0;

  for (const row of local) merged.set(keyOf(row), row);

  for (const row of live) {
    const k = keyOf(row);
    const mine = merged.get(k);
    if (!mine) {
      merged.set(k, row);
      added += 1;
      continue;
    }
    if (!stamp) continue;
    if (num(row[stamp]) > num(mine[stamp])) {
      merged.set(k, row);
      fromLive += 1;
    } else if (num(row[stamp]) < num(mine[stamp])) {
      fromLocal += 1;
    }
  }

  return { rows: [...merged.values()], fromLive, fromLocal, added };
}

// vocab_entries carries a unique slug alongside its unique (lemma, pos). Two
// sides can independently mint the same slug for different words.
export function dedupeSlugs(rows: Row[]): number {
  const seen = new Set<string>();
  let renamed = 0;
  for (const row of rows) {
    const slug = String(row.slug ?? "");
    if (!seen.has(slug)) {
      seen.add(slug);
      continue;
    }
    let n = 2;
    while (seen.has(`${slug}-${n}`)) n += 1;
    row.slug = `${slug}-${n}`;
    seen.add(String(row.slug));
    renamed += 1;
  }
  return renamed;
}

// srs_cards is a fold over review_log, so it is never merged field by field —
// it is recomputed by replaying the merged log through the app's scheduler.
export function rebuildCards(cards: Row[], reviews: Row[]): number {
  const byCard = new Map<string, Row[]>();
  for (const log of reviews) {
    const k = key(log.lemma, log.pos, log.direction);
    const list = byCard.get(k);
    if (list) list.push(log);
    else byCard.set(k, [log]);
  }

  let replayed = 0;
  for (const card of cards) {
    const logs = byCard.get(key(card.lemma, card.pos, card.direction));
    if (!logs?.length) continue;

    logs.sort((a, b) => num(a.review) - num(b.review));
    let state = newCard(new Date(num(logs[0].review)));
    for (const log of logs) {
      state = review(state, log.rating as Rating, new Date(num(log.review))).card;
    }

    card.due = state.due.getTime();
    card.stability = state.stability;
    card.difficulty = state.difficulty;
    card.elapsed_days = state.elapsed_days;
    card.scheduled_days = state.scheduled_days;
    card.reps = state.reps;
    card.lapses = state.lapses;
    card.state = state.state;
    card.learning_steps = state.learning_steps;
    card.last_review = state.last_review ? state.last_review.getTime() : null;
    replayed += 1;
  }
  return replayed;
}

export function merge(local: Dataset, live: Dataset) {
  const articles = mergeBy(
    local.articles,
    live.articles,
    (r) => key(r.slug, r.language),
    "updated_at",
  );
  const tags = mergeBy(local.tags, live.tags, (r) => key(r.slug), null);
  const links = mergeBy(local.links, live.links, (r) => key(r.url), "updated_at");
  const vocab = mergeBy(
    local.vocab,
    live.vocab,
    (r) => key(r.lemma, r.pos),
    "updated_at",
  );
  const cards = mergeBy(
    local.cards,
    live.cards,
    (r) => key(r.lemma, r.pos, r.direction),
    "updated_at",
  );

  // Append-only: a review is identified by its card and the instant it happened.
  const reviews = mergeBy(
    local.reviews,
    live.reviews,
    (r) => key(r.lemma, r.pos, r.direction, r.review),
    null,
  );

  // Production owns settings — the links API token lives here and the browser
  // extensions authenticate against the live copy.
  const settings = mergeBy(live.settings, local.settings, (r) => key(r.key), null);

  const keptLinks = new Set(links.rows.map((r) => String(r.url)));
  const keptTags = new Set(tags.rows.map((r) => String(r.slug)));
  const seenPairs = new Set<string>();
  const linkTags: Row[] = [];
  for (const row of [...local.linkTags, ...live.linkTags]) {
    const k = key(row.link_url, row.tag_slug);
    if (seenPairs.has(k)) continue;
    if (!keptLinks.has(String(row.link_url))) continue;
    if (!keptTags.has(String(row.tag_slug))) continue;
    seenPairs.add(k);
    linkTags.push(row);
  }

  const renamed = dedupeSlugs(vocab.rows);
  const replayed = rebuildCards(cards.rows, reviews.rows);

  const dataset: Dataset = {
    articles: articles.rows,
    tags: tags.rows,
    links: links.rows,
    linkTags,
    vocab: vocab.rows,
    cards: cards.rows,
    reviews: reviews.rows,
    settings: settings.rows,
  };

  return {
    dataset,
    articles,
    tags,
    links,
    vocab,
    cards,
    reviews,
    renamed,
    replayed,
  };
}
