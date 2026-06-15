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
