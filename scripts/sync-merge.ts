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
  deleted: number;
  resurrected: number;
};

export type SyncState = {
  version: 1;
  syncedAt: number; // epoch seconds, matching the *_at columns
  keys: Record<string, string[]>;
};

export type Ancestor = { keys: Set<string>; syncedAt: number } | null;

export function ancestorFor(state: SyncState | null, table: string): Ancestor {
  if (!state) return null;
  return { keys: new Set(state.keys[table] ?? []), syncedAt: state.syncedAt };
}

export function mergeBy(
  local: Row[],
  live: Row[],
  keyOf: (row: Row) => string,
  stamp: string | null,
  ancestor: Ancestor = null,
): MergeStat {
  const localByKey = new Map<string, Row>();
  for (const row of local) localByKey.set(keyOf(row), row);
  const liveByKey = new Map<string, Row>();
  for (const row of live) liveByKey.set(keyOf(row), row);

  const merged = new Map<string, Row>();
  let fromLive = 0;
  let fromLocal = 0;
  let added = 0;
  let deleted = 0;
  let resurrected = 0;

  const editedSinceSync = (row: Row) =>
    !!stamp && !!ancestor && num(row[stamp]) > ancestor.syncedAt;

  for (const [k, mine] of localByKey) {
    const theirs = liveByKey.get(k);

    if (theirs) {
      if (!stamp) {
        merged.set(k, mine);
      } else if (num(theirs[stamp]) > num(mine[stamp])) {
        merged.set(k, theirs);
        fromLive += 1;
      } else {
        merged.set(k, mine);
        if (num(theirs[stamp]) < num(mine[stamp])) fromLocal += 1;
      }
      continue;
    }

    if (ancestor?.keys.has(k)) {
      if (editedSinceSync(mine)) {
        merged.set(k, mine);
        resurrected += 1;
      } else {
        deleted += 1;
      }
      continue;
    }
    merged.set(k, mine);
  }

  for (const [k, theirs] of liveByKey) {
    if (localByKey.has(k)) continue;

    if (ancestor?.keys.has(k)) {
      if (editedSinceSync(theirs)) {
        merged.set(k, theirs);
        resurrected += 1;
      } else {
        deleted += 1;
      }
      continue;
    }
    merged.set(k, theirs);
    added += 1;
  }

  return {
    rows: [...merged.values()],
    fromLive,
    fromLocal,
    added,
    deleted,
    resurrected,
  };
}

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
      state = review(
        state,
        log.rating as Rating,
        new Date(num(log.review)),
      ).card;
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

export const ARTICLE_KEY = (r: Row) => key(r.slug, r.language);
export const TAG_KEY = (r: Row) => key(r.slug);
export const LINK_KEY = (r: Row) => key(r.url);
export const VOCAB_KEY = (r: Row) => key(r.lemma, r.pos);
export const CARD_KEY = (r: Row) => key(r.lemma, r.pos, r.direction);
export const LINK_TAG_KEY = (r: Row) => key(r.link_url, r.tag_slug);

export function merge(
  local: Dataset,
  live: Dataset,
  state: SyncState | null = null,
) {
  const articles = mergeBy(
    local.articles,
    live.articles,
    ARTICLE_KEY,
    "updated_at",
    ancestorFor(state, "articles"),
  );
  const tags = mergeBy(
    local.tags,
    live.tags,
    TAG_KEY,
    "created_at",
    ancestorFor(state, "tags"),
  );
  const links = mergeBy(
    local.links,
    live.links,
    LINK_KEY,
    "updated_at",
    ancestorFor(state, "links"),
  );
  const vocab = mergeBy(
    local.vocab,
    live.vocab,
    VOCAB_KEY,
    "updated_at",
    ancestorFor(state, "vocab"),
  );
  const cards = mergeBy(
    local.cards,
    live.cards,
    CARD_KEY,
    "updated_at",
    ancestorFor(state, "cards"),
  );

  const reviews = mergeBy(
    local.reviews,
    live.reviews,
    (r) => key(r.lemma, r.pos, r.direction, r.review),
    null,
  );

  const settings = mergeBy(
    live.settings,
    local.settings,
    (r) => key(r.key),
    null,
  );

  const linkTagsMerged = mergeBy(
    local.linkTags,
    live.linkTags,
    LINK_TAG_KEY,
    null,
    ancestorFor(state, "linkTags"),
  );
  const keptLinks = new Set(links.rows.map((r) => String(r.url)));
  const keptTags = new Set(tags.rows.map((r) => String(r.slug)));
  const linkTags = linkTagsMerged.rows.filter(
    (r) =>
      keptLinks.has(String(r.link_url)) && keptTags.has(String(r.tag_slug)),
  );

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

  const stats = [articles, tags, links, vocab, cards, linkTagsMerged];
  const deleted = stats.reduce((n, s) => n + s.deleted, 0);
  const resurrected = stats.reduce((n, s) => n + s.resurrected, 0);

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
    deleted,
    resurrected,
  };
}

export function stateFrom(dataset: Dataset, syncedAt: number): SyncState {
  return {
    version: 1,
    syncedAt,
    keys: {
      articles: dataset.articles.map(ARTICLE_KEY),
      tags: dataset.tags.map(TAG_KEY),
      links: dataset.links.map(LINK_KEY),
      linkTags: dataset.linkTags.map(LINK_TAG_KEY),
      vocab: dataset.vocab.map(VOCAB_KEY),
      cards: dataset.cards.map(CARD_KEY),
    },
  };
}
