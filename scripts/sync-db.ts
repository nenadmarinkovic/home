import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { merge, stateFrom, type Dataset, type SyncState } from "./sync-merge";

const SSH_HOST = process.env.SYNC_SSH_HOST ?? "root@162.55.63.165";
const SERVICE = process.env.SYNC_SERVICE ?? "home-nextjs-hv2sew";
const REMOTE_DB = process.env.SYNC_REMOTE_DB ?? "/app/data/articles.db";
const LOCAL_DB =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "articles.db");

const AGENT = path.join(process.cwd(), "scripts", "sync-agent.mjs");
const STATE = path.join(path.dirname(LOCAL_DB), ".sync-state.json");
const dryRun = process.argv.includes("--dry-run");

function readState(): SyncState | null {
  if (!fs.existsSync(STATE)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE, "utf8")) as SyncState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function localAgent(mode: "dump" | "apply", input?: string): string {
  return execFileSync("node", [AGENT, mode], {
    input,
    env: { ...process.env, DATABASE_PATH: LOCAL_DB },
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function remoteAgent(mode: "dump" | "apply", input?: string): string {
  const encoded = fs.readFileSync(AGENT).toString("base64");
  const script = `
set -e
C=$(docker ps -q -f name=${SERVICE} | head -1)
if [ -z "$C" ]; then echo "no running container for ${SERVICE}" >&2; exit 1; fi
printf %s '${encoded}' | base64 -d > /tmp/sync-agent.mjs
docker cp /tmp/sync-agent.mjs "$C":/app/sync-agent.mjs >/dev/null
set +e
docker exec -i -e DATABASE_PATH=${REMOTE_DB} "$C" node /app/sync-agent.mjs ${mode}
rc=$?
docker exec "$C" rm -f /app/sync-agent.mjs >/dev/null 2>&1
rm -f /tmp/sync-agent.mjs
exit $rc
`;
  return execFileSync("ssh", ["-o", "BatchMode=yes", SSH_HOST, script], {
    input,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function snapshot(): void {
  const backup = `${LOCAL_DB}.pre-sync`;
  if (!fs.existsSync(LOCAL_DB)) return;
  const db = new Database(LOCAL_DB, { readonly: true });
  fs.rmSync(backup, { force: true });
  db.exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`);
  db.close();
}

function main() {
  console.log(`local  ${LOCAL_DB}`);
  console.log(`live   ${SSH_HOST} ${SERVICE}:${REMOTE_DB}`);
  console.log("");

  const local: Dataset = JSON.parse(localAgent("dump"));
  const live: Dataset = JSON.parse(remoteAgent("dump"));

  const before = (d: Dataset, name: keyof Dataset) => d[name].length;
  for (const table of [
    "articles",
    "links",
    "vocabulary",
    "cards",
    "reviews",
  ] as const) {
    console.log(
      `${table.padEnd(9)} local ${String(before(local, table)).padStart(4)}   ` +
        `live ${String(before(live, table)).padStart(4)}`,
    );
  }

  const state = readState();
  const result = merge(local, live, state);
  console.log("");
  if (!state) {
    console.log(
      "no previous sync recorded — merging as a union, so deletions on either\n" +
        "side will not propagate this once. They will from the next run on.",
    );
    console.log("");
  }
  console.log(
    `merged    articles ${result.dataset.articles.length}  ` +
      `links ${result.dataset.links.length}  ` +
      `vocabulary ${result.dataset.vocabulary.length}  ` +
      `cards ${result.dataset.cards.length}  ` +
      `reviews ${result.dataset.reviews.length}`,
  );
  console.log(
    `resolved  ${result.articles.fromLive + result.links.fromLive + result.vocabulary.fromLive} row(s) taken from live, ` +
      `${result.articles.fromLocal + result.links.fromLocal + result.vocabulary.fromLocal} kept from local`,
  );
  console.log(
    `replayed  ${result.replayed} card(s) rebuilt from the review log`,
  );
  if (result.deleted > 0) {
    console.log(
      `deleted   ${result.deleted} row(s) removed on one side since the last sync`,
    );
  }
  if (result.resurrected > 0) {
    console.log(
      `kept      ${result.resurrected} row(s) deleted on one side but edited on ` +
        `the other since the last sync — the edit won`,
    );
  }
  if (result.renamed > 0) {
    console.log(`renamed   ${result.renamed} vocabulary slug collision(s)`);
  }

  if (dryRun) {
    console.log("\ndry run — nothing written");
    return;
  }

  const payload = JSON.stringify(result.dataset);

  snapshot();
  const localResult = JSON.parse(localAgent("apply", payload));
  console.log(`\nlocal  written  ${JSON.stringify(localResult.counts)}`);

  const liveResult = JSON.parse(remoteAgent("apply", payload));
  console.log(`live   written  ${JSON.stringify(liveResult.counts)}`);

  fs.writeFileSync(
    STATE,
    JSON.stringify(
      stateFrom(result.dataset, Math.floor(Date.now() / 1000)),
      null,
      2,
    ),
  );

  console.log(
    "\nBoth sides now match. The live site caches article reads for up to an " +
      "hour (unstable_cache, tag 'articles'), so a change pushed up may not " +
      "appear immediately.",
  );
}

main();
