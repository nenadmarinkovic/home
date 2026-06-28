# nenadmarinkovic.com

Personal site of Nenad Marinković — articles, a Serbian-language word library, and a few small tools.

Built with [Next.js](https://nextjs.org) (App Router) and SQLite via Drizzle.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Stack

- Next.js (App Router)
- Tailwind CSS v4 with shadcn/ui
- SQLite + Drizzle ORM
- Self-hosted fonts via `next/font/local`:
  - **Google Sans Flex** (sans, variable) — subsetted to Latin + Latin Ext, axes trimmed to `wght` and `opsz`
  - **Newsreader** (serif, variable, normal + italic) — subsetted to Latin + Latin Ext

Font files live in `app/fonts/`.

## Content

Articles are plain Markdown in `content/en/` — no CMS, no database for posts. Keeps the site portable.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (runs migrations + seed first)
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run db:migrate` — apply Drizzle migrations
- `npm run db:studio` — Drizzle Studio
- `npm run db:export` — write articles from the DB back to `content/`
- `npm run lib:export` — export the word library to `content/lib/`

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
