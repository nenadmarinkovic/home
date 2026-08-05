# nenadmarinkovic.com

Personal site of Nenad Marinković — writing, a saved-links collection, a
German–Serbian word library with spaced repetition, and a few small tools. Built
with [Next.js](https://nextjs.org) (App Router) and SQLite via Drizzle,
installable as a PWA, and deployable to a self-hosted server.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The first run creates a local SQLite database under
`data/` and applies migrations; `npm run db:seed` will load the Markdown articles
in `content/` into it.

## Features

- **Writing** — articles written in a TipTap rich-text editor in the admin area
  and rendered as Markdown. The editor is lazy-loaded so visitors never pay for
  it. Articles can be exported back to `content/` so the source stays portable
  and version-controlled.
- **Word library** — a German↔Serbian vocabulary trainer with spaced repetition
  (FSRS via `ts-fsrs`). Each entry generates two cards (de→sr, sr→de); reviews
  are scheduled per direction. Mistral powers term enrichment (gender, plural,
  conjugations), example sentences, translation, and audio transcription.
- **Offline review** — the reviewable deck is mirrored into IndexedDB and the app
  ships as a PWA with a service worker, so review runs offline on a phone and
  syncs back when reconnected.
- **Links** — a tagged bookmark collection with AI summaries, fed by companion
  Chrome and Firefox extensions (`extensions/`).
- **Ops log** — the admin **Log** is a live dashboard for the personal stack: it
  pulls a Dokploy snapshot and shows projects, applications, databases, domains,
  and deployment status at a glance.
- **Pages** — home, writing, links, and contact, plus an RSS feed at `/rss.xml`.
- **Admin** — a password-protected area (`/admin`) with four tools: **Writing**
  (drafts, publishing, snapshots to git), **Lib** (the word library and reviews),
  **Log** (the ops dashboard above), and **Links**. Landing page shows a live
  wall clock alongside the date.

## Stack

- Next.js (App Router) with a service-worker PWA
- Tailwind CSS v4 with shadcn/ui
- SQLite + Drizzle ORM (`better-sqlite3`)
- FSRS spaced repetition (`ts-fsrs`)
- Mistral for enrichment, translation, transcription, and summaries
- Dokploy API for the infrastructure page
- Self-hosted fonts via `next/font/local`:
  - **Google Sans Flex** (sans, variable) — subsetted to Latin + Latin Ext, axes trimmed to `wght` and `opsz`
  - **Newsreader** (serif, variable, normal + italic) — subsetted to Latin + Latin Ext

Font files live in `app/fonts/`.

## Project structure

```
app/                  Routes (App Router)
  writing/            Articles index and per-article pages
  links/              Public links collection
  contact/            Contact page
  offline/            PWA offline fallback
  rss.xml/            RSS feed
  admin/              Password-protected admin area
    writing/          Drafts, publishing, snapshots to git
    lib/              Word library + review (lib/review)
    log/              Ops dashboard (Dokploy snapshot)
    links/            Manage saved links
  api/                Route handlers (articles, lib, links, dokploy, auth…)
  fonts/              Self-hosted variable fonts
components/           Shared UI (shadcn/ui + custom)
lib/                  Domain logic: auth, DB access, FSRS, Mistral, exports, utils
db/                   Drizzle schema and SQLite client
drizzle/              Generated SQL migrations
scripts/              Migrate, seed, and export scripts
content/              Markdown articles (source of truth for writing)
extensions/           Chrome and Firefox link-saver extensions
public/               Static assets, manifest, and service worker
```

## Authentication

Access to `/admin` and mutating API routes is gated by a signed session cookie
(see `proxy.ts` and `lib/auth.ts`). Sign in at `/login` with `ADMIN_PASSWORD`.
Sessions slide forward on active use so a PWA stays signed in, up to a hard TTL;
bumping `AUTH_VALID_AFTER` invalidates all existing sessions.

## Environment variables

Set these in `.env.local` for development (none are committed):

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Password for the admin login |
| `AUTH_SECRET` | Secret used to sign session cookies |
| `AUTH_VALID_AFTER` | Optional cutoff; sessions issued before it are rejected |
| `DATABASE_PATH` | SQLite file path (defaults to `data/articles.db`) |
| `MISTRAL_API_KEY` | Mistral API key for AI features |
| `MISTRAL_MODEL`, `MISTRAL_CHAT_MODEL`, `MISTRAL_TRANSLATE_MODEL`, `MISTRAL_SUMMARIZE_MODEL`, `MISTRAL_TRANSCRIBE_MODEL` | Optional per-task model overrides |
| `DOKPLOY_URL`, `DOKPLOY_API_KEY` | Dokploy instance powering the infrastructure page and the admin Log dashboard |
| `EMBED_APPS` | Comma-separated `name=origin` map of apps that may be framed in an article, e.g. `bim=http://localhost:3002`. Doubles as the `postMessage` allowlist |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin; overrides the default in `lib/site.ts` |
| `NEXT_PUBLIC_BUILD_ID` | Optional explicit build id (otherwise derived from the git SHA) |

## Content

Articles are plain Markdown in `content/en/`. They seed the database and can be
re-exported from it, so the filesystem stays the portable source of truth — no
external CMS.

### Embedding apps and device mockups

Two fenced blocks in an article body render live frames. Both take an `app` name
from `EMBED_APPS` rather than a URL, so a post survives the move from dev to
production.

An `embed` fence is a wide, full-bleed figure — the app at desktop size:

````markdown
```embed
app: bim
path: /
title: bim
caption: A map of what is being built around you.
visit: https://bim.nenadmarinkovic.com
ratio: 3/2
```
````

A `device` fence is the iPhone mockup. It frames the same apps by name, or an
internal `/mockup/*` route, or a video or image:

````markdown
```device
app: bim
path: /
alt: bim running on a phone
caption: The same map, pocket-sized.
visit: https://bim.nenadmarinkovic.com
side: right
```
````

| Field | Fence | Meaning |
| --- | --- | --- |
| `app` | both | Key from `EMBED_APPS`. Unknown names leave a visible code block |
| `path` | both | Public path on that app; drives the `visit ↗` fallback link |
| `frame` | both | Path actually framed, default `<path>/embed` |
| `route` | `device` | An internal `/mockup/*` page instead of an app |
| `video`, `image`, `poster` | `device` | Media instead of a frame |
| `side` | `device` | `left` or `right` to float beside the text above 768px |
| `ratio` | `embed` | `16/9` (default), `3/2`, `4/3`, `1/1` |
| `title`, `link` | `embed` | Card heading and its open label |
| `alt`, `caption`, `visit` | both | Frame title, caption text, and the "for the full experience" link |

The framed app must allow this origin to embed it — for bim that is
`EMBED_PARENTS`. Theme changes are forwarded over `postMessage`, and an app can
send back a `controls` list that renders as pills under an `embed` figure. A
`device` frame is deliberately non-interactive so it never steals touch scroll.

## Syncing local and production

The local database and the one on the server are both written to — articles from
either admin area, links from the browser extensions, reviews from the phone.
`npm run db:sync` merges them in both directions and writes the result to both
sides, so either machine can be edited and they converge.

```bash
npm run db:sync -- --dry-run   # report the merge, write nothing
npm run db:sync                # merge and write both sides
```

Rows are matched on natural keys, never on autoincrement ids, so the two
databases are free to disagree about ids:

| Table | Rule |
| --- | --- |
| `articles` | last write wins on `(slug, language)` by `updated_at` |
| `links`, `tags`, `link_tags` | union by `url` / `slug`; last write wins |
| `vocab_entries` | union by `(lemma, pos)`; slug collisions get suffixed |
| `review_log` | union — append-only, identified by card and instant |
| `srs_cards` | **recomputed** by replaying the merged log through `ts-fsrs` |
| `settings` | production wins — it holds the links API token |

Scheduling state is never merged field by field. `srs_cards` is a fold over
`review_log`, so it is discarded and rebuilt from the merged log with the same
scheduler the app uses, which is what makes reviewing on the phone and on the
laptop safe to combine.

It reaches production over SSH and runs inside the app container, using its
`better-sqlite3` (the host has no `sqlite3` binary). Override
`SYNC_SSH_HOST`, `SYNC_SERVICE`, or `SYNC_REMOTE_DB` if any of those change.
The local database is snapshotted to `data/articles.db.pre-sync` first.

`npm run db:sync:test` builds two divergent throwaway databases, merges them,
and asserts the outcome — conflict resolution, id remapping, the FSRS replay,
and idempotence. Run it after any schema change. The sync also refuses to run if
a migration adds a column it does not know about, rather than silently dropping
that data on both sides.

## Exporting the word library

`npm run lib:export` dumps the whole vocab DB into the repo so it can be read
anywhere — including the GitHub mobile app — and kept in version control:

- `content/lib/vocab.md` — readable Markdown grouped by part of speech, with
  gender/plural/level/tags, examples, and collapsible conjugation tables.
- `content/lib/vocab.json` — a complete dump (entries, SRS cards, and review
  log) for backups.

Run it against the machine that holds the real DB, then commit the result:

```bash
npm run lib:export
git add content/lib && git commit -m "Update vocab export"
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (runs migrations + seed first)
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run db:generate` — generate a Drizzle migration from schema changes
- `npm run db:migrate` — apply Drizzle migrations
- `npm run db:studio` — Drizzle Studio
- `npm run db:seed` — seed the DB from `content/`
- `npm run db:export` — write articles from the DB back to `content/`
- `npm run db:sync` — two-way merge between the local and production databases
- `npm run db:sync:test` — self-test for the sync's merge rules
- `npm run lib:export` — export the word library to `content/lib/`

## Deployment

The site is deployed on a [Hetzner](https://www.hetzner.com/) VPS, managed with
[Dokploy](https://dokploy.com/) — the same instance the admin **Log** dashboard
reads from. Pushing the branch triggers a Dokploy build and deploy.

The database lives on a mounted volume in production (`data/` is git-ignored), so
`DATABASE_PATH` must point at that persistent storage. `build` and `start` run
migrations and the seed first. The service worker is versioned by build id, so
each deploy supersedes the previously cached app shell.

See [DEPLOY.md](DEPLOY.md) for the production checklist: DNS, Dokploy domains and
redirects, production environment, volumes, and database backups.
