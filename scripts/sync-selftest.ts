import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";

import Database from "better-sqlite3";

import { merge, stateFrom, type Dataset, type SyncState } from "./sync-merge";
import { newCard, review, type SchedulerCard } from "../lib/fsrs";
import type { Rating } from "../db/schema";

const ROOT = process.cwd();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "sync-selftest-"));
const AGENT = path.join(ROOT, "scripts", "sync-agent.mjs");

function makeDb(name: string) {
  const p = path.join(TMP, name);
  execFileSync("node", [path.join(ROOT, "scripts", "migrate.mjs")], {
    env: { ...process.env, DATABASE_PATH: p },
    cwd: ROOT,
    stdio: "pipe",
  });
  return p;
}

function agent(dbPath: string, mode: string, input?: string) {
  return execFileSync("node", [AGENT, mode], {
    input,
    env: { ...process.env, DATABASE_PATH: dbPath },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

type CardStateRow = {
  id: number;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  learning_steps: number;
  last_review: number | null;
};

const S = (t: number) => Math.floor(t / 1000);
const T0 = Date.UTC(2026, 6, 1, 9, 0, 0);
const DAY = 86400000;

const localPath = makeDb("local.db");
const livePath = makeDb("live.db");

function seed(
  dbPath: string,
  opts: {
    articleTitle: string;
    articleUpdated: number;
    extraArticle?: string;
    links: { url: string; title: string; updated: number }[];
    tags: string[];
    linkTags: [string, string][];
    vocabulary: { lemma: string; pos: string; slug: string; tr: string; updated: number }[];
    reviews: { lemma: string; pos: string; dir: string; at: number; rating: number }[];
  },
) {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  db.prepare(
    `insert into articles (slug, language, title, subtitle, description, image, body, draft, date, created_at, updated_at)
     values ('shared','en',?,'','','','body of shared',0,'2026-07-01',?,?)`,
  ).run(opts.articleTitle, S(T0), S(opts.articleUpdated));

  if (opts.extraArticle) {
    db.prepare(
      `insert into articles (slug, language, title, subtitle, description, image, body, draft, date, created_at, updated_at)
       values (?, 'en', ?, '', '', '', 'only on one side', 0, '2026-07-02', ?, ?)`,
    ).run(opts.extraArticle, opts.extraArticle, S(T0), S(T0));
  }

  for (const t of opts.tags) {
    db.prepare(`insert into tags (slug, name, created_at) values (?,?,?)`).run(t, t, S(T0));
  }
  for (const l of opts.links) {
    db.prepare(
      `insert into links (url, title, type, note, created_at, updated_at) values (?,?,'article','',?,?)`,
    ).run(l.url, l.title, S(T0), S(l.updated));
  }
  for (const [url, tag] of opts.linkTags) {
    const linkId = db.prepare(`select id from links where url=?`).get(url) as { id: number } | undefined;
    const tagId = db.prepare(`select id from tags where slug=?`).get(tag) as { id: number } | undefined;
    if (linkId && tagId) {
      db.prepare(`insert into link_tags (link_id, tag_id) values (?,?)`).run(linkId.id, tagId.id);
    }
  }

  for (const v of opts.vocabulary) {
    db.prepare(
      `insert into vocab_entries (slug, term, lemma, pos, translation_sr, examples, conjugations, notes, tags, source, created_at, updated_at)
       values (?,?,?,?,?,'[]','{}','','','manual',?,?)`,
    ).run(v.slug, v.lemma, v.lemma, v.pos, v.tr, S(T0), S(v.updated));
  }

  const entries = db.prepare(`select id, lemma, pos from vocab_entries`).all() as {
    id: number;
    lemma: string;
    pos: string;
  }[];
  for (const e of entries) {
    for (const dir of ["de_sr", "sr_de"]) {
      const c = newCard(new Date(T0));
      db.prepare(
        `insert into srs_cards (entry_id, direction, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, learning_steps, last_review, suspended, created_at, updated_at)
         values (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)`,
      ).run(
        e.id, dir, c.due.getTime(), c.stability, c.difficulty, c.elapsed_days,
        c.scheduled_days, c.reps, c.lapses, c.state, c.learning_steps, null,
        S(T0), S(T0),
      );
    }
  }

  for (const r of opts.reviews) {
    const row = db
      .prepare(
        `select c.id, c.due, c.stability, c.difficulty, c.elapsed_days, c.scheduled_days,
                c.reps, c.lapses, c.state, c.learning_steps, c.last_review
         from srs_cards c join vocab_entries v on v.id=c.entry_id
         where v.lemma=? and v.pos=? and c.direction=?`,
      )
      .get(r.lemma, r.pos, r.dir) as CardStateRow;
    const card: SchedulerCard = {
      due: new Date(row.due),
      stability: row.stability,
      difficulty: row.difficulty,
      elapsed_days: row.elapsed_days,
      scheduled_days: row.scheduled_days,
      reps: row.reps,
      lapses: row.lapses,
      state: row.state as SchedulerCard["state"],
      learning_steps: row.learning_steps,
      last_review: row.last_review ? new Date(row.last_review) : undefined,
    };
    const res = review(card, r.rating as Rating, new Date(r.at));
    db.prepare(
      `update srs_cards set due=?, stability=?, difficulty=?, elapsed_days=?, scheduled_days=?,
                            reps=?, lapses=?, state=?, learning_steps=?, last_review=?, updated_at=?
       where id=?`,
    ).run(
      res.card.due.getTime(), res.card.stability, res.card.difficulty,
      res.card.elapsed_days, res.card.scheduled_days, res.card.reps,
      res.card.lapses, res.card.state, res.card.learning_steps,
      res.card.last_review ? res.card.last_review.getTime() : null,
      S(r.at), row.id,
    );
    db.prepare(
      `insert into review_log (card_id, rating, state, due, stability, difficulty, elapsed_days,
                               last_elapsed_days, scheduled_days, learning_steps, review, duration_ms)
       values (?,?,?,?,?,?,?,?,?,?,?,0)`,
    ).run(
      row.id, res.log.rating, res.log.state, res.log.due.getTime(), res.log.stability,
      res.log.difficulty, res.log.elapsed_days, res.log.last_elapsed_days,
      res.log.scheduled_days, res.log.learning_steps, res.log.review.getTime(),
    );
  }
  db.close();
}

seed(localPath, {
  articleTitle: "Shared — edited locally (newer)",
  articleUpdated: T0 + 5 * DAY,
  extraArticle: "local-only",
  links: [{ url: "https://a.example/1", title: "A", updated: T0 }],
  tags: ["ai"],
  linkTags: [["https://a.example/1", "ai"]],
  vocabulary: [
    { lemma: "haus", pos: "noun", slug: "haus", tr: "kuća (local)", updated: T0 + DAY },
    { lemma: "lokalwort", pos: "noun", slug: "wort", tr: "samo lokalno", updated: T0 },
  ],
  reviews: [
    { lemma: "haus", pos: "noun", dir: "de_sr", at: T0 + 1 * DAY, rating: 3 },
    { lemma: "haus", pos: "noun", dir: "de_sr", at: T0 + 2 * DAY, rating: 4 },
  ],
});

seed(livePath, {
  articleTitle: "Shared — edited live (older)",
  articleUpdated: T0 + 1 * DAY,
  extraArticle: "live-only",
  links: [
    { url: "https://a.example/1", title: "A renamed on live", updated: T0 + 3 * DAY },
    { url: "https://b.example/2", title: "B saved by extension", updated: T0 + DAY },
  ],
  tags: ["ai", "web"],
  linkTags: [["https://b.example/2", "web"]],
  vocabulary: [
    { lemma: "haus", pos: "noun", slug: "haus", tr: "kuća, dom (live, newer)", updated: T0 + 4 * DAY },
    { lemma: "livewort", pos: "noun", slug: "wort", tr: "samo live", updated: T0 },
  ],
  reviews: [
    { lemma: "haus", pos: "noun", dir: "de_sr", at: T0 + 3 * DAY, rating: 3 },
    { lemma: "haus", pos: "noun", dir: "sr_de", at: T0 + 3 * DAY, rating: 2 },
  ],
});

const local: Dataset = JSON.parse(agent(localPath, "dump"));
const live: Dataset = JSON.parse(agent(livePath, "dump"));
const result = merge(local, live);
const payload = JSON.stringify(result.dataset);
agent(localPath, "apply", payload);
agent(livePath, "apply", payload);

const after = (p: string) => JSON.parse(agent(p, "dump")) as Dataset;
const A = after(localPath);
const B = after(livePath);

function sorted(d: Dataset) {
  return JSON.stringify({
    articles: [...d.articles].sort((a, b) => String(a.slug).localeCompare(String(b.slug))),
    links: [...d.links].sort((a, b) => String(a.url).localeCompare(String(b.url))),
    linkTags: [...d.linkTags].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    vocabulary: [...d.vocabulary].sort((a, b) => String(a.lemma).localeCompare(String(b.lemma))),
    cards: [...d.cards].sort((a, b) => JSON.stringify([a.lemma, a.direction]).localeCompare(JSON.stringify([b.lemma, b.direction]))),
    reviews: [...d.reviews].sort((a, b) => JSON.stringify([a.lemma, a.direction, a.review]).localeCompare(JSON.stringify([b.lemma, b.direction, b.review]))),
  });
}

let pass = 0;
const check = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
    pass += 1;
  } catch (e) {
    console.log(`  FAIL ${name}\n       ${(e as Error).message}`);
    process.exitCode = 1;
  }
};

console.log("\nassertions:");

check("both sides converge to identical content", () => {
  assert.strictEqual(sorted(A), sorted(B));
});

check("newer article edit wins (local was newer)", () => {
  const a = A.articles.find((r) => r.slug === "shared")!;
  assert.strictEqual(a.title, "Shared — edited locally (newer)");
});

check("articles unique to each side both survive", () => {
  const slugs = A.articles.map((r) => r.slug).sort();
  assert.deepStrictEqual(slugs, ["local-only", "live-only", "shared"].sort());
});

check("newer link edit wins (live was newer)", () => {
  const l = A.links.find((r) => r.url === "https://a.example/1")!;
  assert.strictEqual(l.title, "A renamed on live");
});

check("link saved only by the extension survives", () => {
  assert.ok(A.links.some((r) => r.url === "https://b.example/2"));
});

check("link/tag pairs survive id remapping on both sides", () => {
  assert.strictEqual(A.linkTags.length, 2);
  assert.ok(A.linkTags.some((r) => r.link_url === "https://a.example/1" && r.tag_slug === "ai"));
  assert.ok(A.linkTags.some((r) => r.link_url === "https://b.example/2" && r.tag_slug === "web"));
});

check("newer vocabulary translation wins", () => {
  const v = A.vocabulary.find((r) => r.lemma === "haus")!;
  assert.strictEqual(v.translation_sr, "kuća, dom (live, newer)");
});

check("vocabulary slug collision is renamed, both entries kept", () => {
  const lemmas = A.vocabulary.map((r) => r.lemma).sort();
  assert.deepStrictEqual(lemmas, ["haus", "livewort", "lokalwort"]);
  const slugs = A.vocabulary.map((r) => r.slug);
  assert.strictEqual(new Set(slugs).size, slugs.length, `slugs not unique: ${slugs}`);
});

check("review log is the union of both sides, no duplicates", () => {
  const hausDeSr = A.reviews.filter((r) => r.lemma === "haus" && r.direction === "de_sr");
  assert.strictEqual(hausDeSr.length, 3, `expected 3 got ${hausDeSr.length}`);
  const stamps = hausDeSr.map((r) => r.review).sort();
  assert.deepStrictEqual(stamps, [T0 + DAY, T0 + 2 * DAY, T0 + 3 * DAY]);
});

check("card state equals a clean replay of the merged log", () => {
  const card = A.cards.find((r) => r.lemma === "haus" && r.direction === "de_sr")!;
  const logs = A.reviews
    .filter((r) => r.lemma === "haus" && r.direction === "de_sr")
    .sort((a, b) => (a.review as number) - (b.review as number));
  let s = newCard(new Date(logs[0].review as number));
  for (const l of logs)
    s = review(s, l.rating as Rating, new Date(l.review as number)).card;
  assert.strictEqual(card.reps, s.reps, "reps");
  assert.strictEqual(card.lapses, s.lapses, "lapses");
  assert.strictEqual(card.state, s.state, "state");
  assert.strictEqual(card.stability, s.stability, "stability");
  assert.strictEqual(card.difficulty, s.difficulty, "difficulty");
  assert.strictEqual(card.due, s.due.getTime(), "due");
});

check("card reps reflect all three merged reviews", () => {
  const card = A.cards.find((r) => r.lemma === "haus" && r.direction === "de_sr")!;
  assert.strictEqual(card.reps, 3, `expected reps=3, got ${card.reps}`);
});

check("a card reviewed only on live keeps its progress", () => {
  const card = A.cards.find((r) => r.lemma === "haus" && r.direction === "sr_de")!;
  assert.strictEqual(card.reps, 1);
});

check("never-reviewed cards stay new", () => {
  const card = A.cards.find((r) => r.lemma === "lokalwort" && r.direction === "de_sr")!;
  assert.strictEqual(card.reps, 0);
  assert.strictEqual(card.state, 0);
});

check("a column added by a future migration aborts the sync", () => {
  const driftPath = makeDb("drift.db");
  const db = new Database(driftPath);
  db.exec("alter table links add column archived integer default 0");
  db.close();

  let failed = false;
  let message = "";
  try {
    agent(driftPath, "dump");
  } catch (e) {
    failed = true;
    message = String((e as { stderr?: Buffer }).stderr ?? "");
  }
  assert.ok(failed, "expected the agent to refuse to dump an unknown column");
  assert.match(message, /links\.archived/);
});

check("running the sync twice changes nothing (idempotent)", () => {
  const again = merge(after(localPath), after(livePath));
  agent(localPath, "apply", JSON.stringify(again.dataset));
  agent(livePath, "apply", JSON.stringify(again.dataset));
  assert.strictEqual(sorted(after(localPath)), sorted(A));
  assert.strictEqual(sorted(after(livePath)), sorted(A));
});

const SYNCED_AT = Math.floor((T0 + 10 * DAY) / 1000);
let state: SyncState = stateFrom(result.dataset, SYNCED_AT);

function syncAgain(st: SyncState | null) {
  const l = JSON.parse(agent(localPath, "dump")) as Dataset;
  const v = JSON.parse(agent(livePath, "dump")) as Dataset;
  const r = merge(l, v, st);
  const p = JSON.stringify(r.dataset);
  agent(localPath, "apply", p);
  agent(livePath, "apply", p);
  return r;
}

function exec(dbPath: string, sql: string) {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(sql);
  db.close();
}

check("without a recorded sync, a deletion does not propagate (union)", () => {
  exec(localPath, `delete from articles where slug='live-only'`);
  const r = syncAgain(null);
  assert.strictEqual(r.deleted, 0);
  assert.ok(
    after(localPath).articles.some((a) => a.slug === "live-only"),
    "expected the row to come back without ancestor state",
  );
});

check("with a recorded sync, deleting locally removes it from live too", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  exec(localPath, `delete from articles where slug='live-only'`);
  const r = syncAgain(state);
  assert.strictEqual(r.deleted, 1, `expected 1 deletion, got ${r.deleted}`);
  assert.ok(!after(localPath).articles.some((a) => a.slug === "live-only"));
  assert.ok(!after(livePath).articles.some((a) => a.slug === "live-only"));
});

check("deleting on live removes it locally too", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  exec(livePath, `delete from articles where slug='local-only'`);
  const r = syncAgain(state);
  assert.strictEqual(r.deleted, 1);
  assert.ok(!after(localPath).articles.some((a) => a.slug === "local-only"));
});

check("a row deleted on one side but edited on the other survives", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  exec(
    livePath,
    `update articles set title='edited after the last sync', updated_at=${SYNCED_AT + 60} where slug='shared'`,
  );
  exec(localPath, `delete from articles where slug='shared'`);
  const r = syncAgain(state);
  assert.strictEqual(r.resurrected, 1, `expected 1 resurrection, got ${r.resurrected}`);
  const kept = after(localPath).articles.find((a) => a.slug === "shared");
  assert.ok(kept, "the edited row should have survived the delete");
  assert.strictEqual(kept!.title, "edited after the last sync");
});

check("deleting a link removes its tag pairings", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  exec(localPath, `delete from links where url='https://b.example/2'`);
  syncAgain(state);
  const d = after(livePath);
  assert.ok(!d.links.some((l) => l.url === "https://b.example/2"));
  assert.ok(!d.linkTags.some((l) => l.link_url === "https://b.example/2"));
});

check("review history is never deleted, even when one side loses rows", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  const beforeCount = after(localPath).reviews.length;
  exec(livePath, `delete from review_log`);
  const r = syncAgain(state);
  assert.strictEqual(
    after(localPath).reviews.length,
    beforeCount,
    "reviews must survive a one-sided wipe",
  );
  assert.strictEqual(after(livePath).reviews.length, beforeCount);
  assert.ok(r.replayed > 0, "cards should still rebuild from the restored log");
});

check("deleting a vocabulary entry removes its cards and reviews", () => {
  state = stateFrom(after(localPath), SYNCED_AT);
  exec(localPath, `delete from vocab_entries where lemma='haus'`);
  syncAgain(state);
  const d = after(livePath);
  assert.ok(!d.vocabulary.some((v) => v.lemma === "haus"));
  assert.ok(!d.cards.some((c) => c.lemma === "haus"));
  assert.ok(!d.reviews.some((c) => c.lemma === "haus"));
});

fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\n${pass} passed${process.exitCode ? ", FAILURES ABOVE" : ""}`);
