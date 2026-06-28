# nenadmarinkovic.com

Personal site of Nenad Marinković — articles, a German–Serbian word library with
spaced repetition, a links collection, and a few small tools. Built with
[Next.js](https://nextjs.org) (App Router) and SQLite via Drizzle, installable as
a PWA, and deployable to a self-hosted server.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The first run creates a local SQLite database under
`data/` and applies migrations; `npm run db:seed` will load the Markdown articles
in `content/` into it.

## Features

- **Writing** — articles authored in a TipTap rich-text editor in the admin area
  and rendered as Markdown. They can be exported back to `content/` so the source
  stays portable and version-controlled.
- **Word library** — a German↔Serbian vocabulary trainer with spaced repetition
  (FSRS via `ts-fsrs`). Each entry generates two cards (de→sr, sr→de); reviews
  are scheduled per direction. Mistral powers term enrichment (gender, plural,
  conjugations), example sentences, translation, and audio transcription.
- **Offline review** — the reviewable deck is mirrored into IndexedDB and the app
  ships as a PWA with a service worker, so review runs offline on a phone and
  syncs back when reconnected.
- **Links** — a tagged bookmark collection with AI summaries, fed by companion
  Chrome and Firefox extensions (`extensions/`).
- **Pages** — home, tools, infrastructure, and contact, plus an RSS feed at
  `/rss.xml`.
- **Admin** — a password-protected area (`/admin`) for managing writing, the word
  library and reviews, links, and an activity log.

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
app/            Routes (App Router): public pages, /admin, and /api endpoints
components/     Shared UI (shadcn/ui + custom)
lib/            Domain logic: auth, DB access, FSRS, Mistral, exports, utils
db/             Drizzle schema and SQLite client
drizzle/        Generated SQL migrations
scripts/        Migrate, seed, and export scripts
content/        Markdown articles (source of truth for writing)
extensions/     Chrome and Firefox link-saver extensions
public/         Static assets, manifest, and service worker
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
| `DOKPLOY_URL`, `DOKPLOY_API_KEY` | Dokploy instance for the infrastructure page |
| `NEXT_PUBLIC_BUILD_ID` | Optional explicit build id (otherwise derived from the git SHA) |

## Content

Articles are plain Markdown in `content/en/`. They seed the database and can be
re-exported from it, so the filesystem stays the portable source of truth — no
external CMS.

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
- `npm run lib:export` — export the word library to `content/lib/`

## Deployment

The database lives on a mounted volume in production (`data/` is git-ignored), so
`DATABASE_PATH` should point at persistent storage. `build` and `start` run
migrations and the seed first. The service worker is versioned by build id, so
each deploy supersedes the previously cached app shell.
