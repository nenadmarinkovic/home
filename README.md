# nenadmarinkovic.com

My personal site. I write here about the projects I work on and about tech in
general, keep the links worth holding onto as I come across them, and run a small
German library that quizzes me with spaced repetition and lets me save new words
on the go, by typing or by voice. It is also the admin tool I open every day to
keep an eye on the services running on my Hetzner VPS through Dokploy.

Built with Next.js and SQLite. It runs on a small server I rent, and it installs
on my phone as a PWA.

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The first run creates the SQLite file under
`data/` and applies the migrations. There is no seed data in the repo, so the
site starts empty and you fill it from the admin area.

## What is in here

**Writing.** I write posts in a rich text editor at `/admin/writing` and they
render as Markdown. The editor loads only when I open it, so nobody visiting the
site pays for it. Posts can be exported back to Markdown files and snapshotted to
git when I want them somewhere portable.

**Word library.** A German vocabulary trainer with spaced repetition, using FSRS.
Every entry becomes two cards, one in each direction, and each direction is
scheduled on its own. Mistral fills in the boring parts: gender, plural,
conjugations, example sentences, translations, and transcription when I speak a
word instead of typing it.

**Offline review.** The reviewable deck is mirrored into IndexedDB and the site
ships a service worker, so I can review on my phone underground and it syncs when
I get signal back.

**Links.** A tagged collection of pages worth keeping, with summaries written by
Mistral. I save them with the browser extensions in `extensions/`, or from my
phone through the share sheet.

**Ops log.** `/admin/log` reads my Dokploy instance and shows what is running:
projects, apps, databases, domains, and whether the last deploy went through.

**The public side.** Home, writing, links, contact, an RSS feed at `/rss.xml`, a
sitemap, and a robots file that keeps crawlers out of the admin area.

## Writing posts

Posts live in the database, not in files. `content/` is an export target, not the
source, so editing a Markdown file there does nothing until you seed it back in,
and the seed only inserts posts that do not already exist. It never updates one.

Two things are worth knowing when poking at the database directly:

Article reads go through `unstable_cache` with a one hour window, and the
revalidation only fires when a post is saved through the app. Write a row by hand
and the page keeps serving the old version for a while. Saving again in the admin
area fixes it.

The seed runs on every deploy. If you delete a post from the database but leave
its Markdown file in `content/`, the next deploy puts it back.

## Embedding my other apps

I sometimes want one of my other projects running inside a post rather than
sitting behind a screenshot. A live transit map makes the point better when it is
actually moving. Two fenced blocks do that, and both take an app name from
`EMBED_APPS` instead of a URL, so a post survives moving between my laptop and
the server.

The examples below use bim, my live transit map for Vienna.

An `embed` block is the wide version, the app at desktop size:

````markdown
```embed
app: bim
path: /
title: bim
caption: Every tram, bus and U-Bahn in Vienna, moving in real time.
visit: https://bim.nenadmarinkovic.com
ratio: 3/2
```
````

A `device` block puts it inside an iPhone. It can also frame one of the internal
`/mockup` pages, or just a video or an image:

````markdown
```device
app: bim
path: /
alt: bim running on a phone
caption: The same map, pocket sized, which is where I actually use it.
visit: https://bim.nenadmarinkovic.com
side: right
```
````

| Field                      | Block    | What it does                                                          |
| -------------------------- | -------- | --------------------------------------------------------------------- |
| `app`                      | both     | A name from `EMBED_APPS`. An unknown name leaves a visible code block |
| `path`                     | both     | Public path on that app, used for the fallback link                   |
| `frame`                    | both     | The path actually framed, `<path>/embed` by default                   |
| `route`                    | `device` | An internal `/mockup` page instead of an app                          |
| `video`, `image`, `poster` | `device` | Media instead of a frame                                              |
| `side`                     | `device` | `left` or `right` to float it next to the text on wide screens        |
| `ratio`                    | `embed`  | `16/9` by default, or `3/2`, `4/3`, `1/1`                             |
| `title`, `link`            | `embed`  | The card heading and its open label                                   |
| `alt`, `caption`, `visit`  | both     | Frame title, caption, and the "for the full experience" link          |

The app being framed has to allow it. For bim that is `EMBED_PARENTS`. Theme
changes travel over `postMessage`, and an app can send back a list of controls
that show up as pills under the figure, which is how bim's layer toggles for
trams, buses and the U-Bahn end up rendered in my typography rather than its own.
Adding a layer there makes it show up here for free. A `device` frame is not
interactive on purpose, otherwise it swallows touch scrolling on a phone.

## Saving links from the browser

`extensions/` has the same small extension twice, one for Chrome and one for
Firefox. Neither is published, so both load unpacked. In Chrome open
`chrome://extensions`, turn on Developer mode, click Load unpacked and pick
`extensions/chrome`. In Firefox open `about:debugging#/runtime/this-firefox`,
click Load Temporary Add-on and pick the `manifest.json` inside
`extensions/firefox`, which Firefox forgets again on restart unless you sign it.

Then open its options and set the site URL and an API token, which you generate
on `/admin/links`. After that you can right click any page to save it under a
tag, or click the toolbar icon for the full form, where Summarize drafts a
description from the page text. Only links tagged `public` show up on the public
`/links` page. Each folder has its own README with the details.

## Saving links from a phone

iOS is the awkward case: Chrome there cannot run extensions at all, and a Safari
extension has to ship inside a signed native app. The share sheet covers it
instead, through a Shortcut that either posts to `/api/links` directly or opens
`/save`, a small authenticated form that takes a URL, title, note, tags and the
public toggle, and can call Summarize the way the extensions do. It is prefilled
from the query string — `/save?url=…&title=…` — which also makes it a working
bookmarklet target on any browser without an extension. `extensions/ios/README.md`
has the Shortcut recipes.

`/save` sits behind the same session cookie as `/admin`, so the phone flow needs
no token; the extensions keep using their bearer token. The service worker skips
`/save` deliberately: it caches navigations under their pathname alone, and this
page means nothing without its query string.

## Keeping local and live in sync

Both databases get written to. I write posts from either one, the extensions push
links to the live one, and I review German on my phone, which is also the live
one. `npm run db:sync` merges them in both directions and writes the result to
both sides.

```bash
npm run db:sync -- --dry-run   # show what it would do
npm run db:sync                # actually do it
```

Rows are matched on real keys, never on database ids, so the two sides are free
to disagree about ids.

| Table                        | Rule                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| `articles`                   | most recently edited wins, matched on slug and language          |
| `links`, `tags`, `link_tags` | merged by URL and slug, most recent wins                         |
| `vocab_entries`              | merged on lemma and part of speech, duplicate slugs get a suffix |
| `review_log`                 | merged, never deleted, since it only ever grows                  |
| `srs_cards`                  | thrown away and recomputed from the merged review log            |
| `settings`                   | live wins, because it holds the links API token                  |

Scheduling state is never merged field by field. `srs_cards` is just a running
total of everything in `review_log`, so the sync replays the merged log through
the same scheduler the app uses and rebuilds the cards from scratch. That is what
makes reviewing on my phone and on my laptop safe to combine.

Deletions need one more thing. Given two databases and nothing else, a row that
exists on one side only could equally be something I just created there or
something I deleted on the other side. So the sync writes the merged key list to
`data/.sync-state.json` after both sides accept the write, and compares against
it next time. A key that was there before and is now missing on one side is a
deletion, and it propagates. The very first run has nothing to compare against
and says so.

If a row was deleted on one side but edited on the other since the last sync, the
edit wins and the sync tells you. Losing something I just wrote is worse than an
extra delete.

It reaches the server over SSH and runs inside the app container, because the
host itself has no `sqlite3` binary. Set `SYNC_SSH_HOST`, `SYNC_SERVICE`, or
`SYNC_REMOTE_DB` if any of that changes. The local database is copied to
`data/articles.db.pre-sync` first.

`npm run db:sync:test` builds two throwaway databases that disagree with each
other, merges them, and checks the result: conflicts, id remapping, the card
replay, deletions, and that running it twice changes nothing. Run it after any
schema change. The sync also refuses to run if a migration added a column it does
not know about, instead of quietly dropping that data on both sides.

## Environment variables

Put these in `.env.local`. None of them are committed.

| Variable                         | What it is for                                                 |
| -------------------------------- | -------------------------------------------------------------- |
| `ADMIN_PASSWORD`                 | The admin login                                                |
| `AUTH_SECRET`                    | Signs the session cookie                                       |
| `AUTH_VALID_AFTER`               | Optional cutoff, sessions issued before it stop working        |
| `DATABASE_PATH`                  | Where the SQLite file lives, `data/articles.db` by default     |
| `MISTRAL_API_KEY`                | Mistral, for everything AI shaped                              |
| `MISTRAL_MODEL` and friends      | Optional per task model overrides                              |
| `ELEVENLABS_API_KEY`             | Audio                                                          |
| `DOKPLOY_URL`, `DOKPLOY_API_KEY` | The instance behind the admin Log page                         |
| `EMBED_APPS`                     | `name=origin` pairs of apps allowed in a post, comma separated |
| `BREVO_API_KEY`                  | Brevo, for the contact form                                    |
| `BREVO_SENDER_EMAIL`             | The from address, must be verified in Brevo                    |
| `BREVO_SENDER_NAME`              | Optional display name, defaults to the site name               |
| `CONTACT_RECIPIENT_EMAIL`        | Where contact form mail lands, defaults to `site.author.email` |
| `NEXT_PUBLIC_SITE_URL`           | Canonical origin, overrides the default in `lib/site.ts`       |
| `NEXT_PUBLIC_BUILD_ID`           | Optional, otherwise taken from the git SHA                     |

`EMBED_APPS` is both the name lookup for the embed blocks and the list of origins
allowed to talk to the page. An app that is not in it simply does nothing.

## Contact form

`app/api/contact/route.ts` validates the submission, rate limits by IP (three per
ten minutes), drops anything that filled the hidden `website` honeypot, and hands
the rest to `lib/brevo.ts`, which posts to Brevo's transactional endpoint. The
reply-to is the sender's address, so replying from the inbox goes straight back
to them. `BREVO_SENDER_EMAIL` has to be a sender or domain you authenticated in
Brevo — a raw `@protonmail.com` from address will be rejected.

## Deploying

It runs on a Hetzner VPS managed by Dokploy, the same instance the admin Log page
reads from. Pushing to `main` builds and deploys it.

The database and the uploaded images live on mounted volumes, `/app/data` and
`/app/uploads`, so they survive a redeploy. `DATABASE_PATH` has to point at the
first one. Migrations and the seed run before both `build` and `start`. The
service worker is versioned by build id, so every deploy replaces the cached app
shell.

For a new domain: point the DNS at the server, add the domain to the app in
Dokploy on port 3000 with a Let's Encrypt certificate, add `www` as well so the
redirect can serve HTTPS, and set `NEXT_PUBLIC_SITE_URL` to match. Wait for DNS
to actually resolve before adding the domain, otherwise the certificate request
fails.

Backups are a cron job on the server:

```bash
sqlite3 /path/to/volume/articles.db \
  ".backup '/var/backups/www/articles-$(date +%F).db'"
```

Use `.backup` rather than `cp`. The database runs in WAL mode and a plain copy
can catch a half written page.

## Exporting

`npm run db:export` writes the posts back out to `content/` as Markdown.

`npm run lib:export` dumps the whole word library into `content/lib/`, both as
readable Markdown grouped by part of speech and as a full JSON backup with the
cards and review history. I run it on whichever machine holds the real database
and commit the result, which means I can read my vocabulary from the GitHub app
on my phone.

## Layout

```
app/              Routes
  writing/        Posts
  links/          Saved links
  contact/
  admin/          Password protected: writing, lib, log, links
  api/            Route handlers
  mockup/         Screens used inside the device frames
  fonts/
components/       Shared UI
lib/              Auth, database access, FSRS, Mistral, exports
db/               Drizzle schema and the SQLite client
drizzle/          Generated migrations
scripts/          Migrate, seed, export, sync
content/          Markdown export target
extensions/       Chrome and Firefox link savers, iOS share-sheet recipes
public/
```

## Stack

Next.js with the App Router, Tailwind and shadcn/ui, SQLite through Drizzle and
`better-sqlite3`, FSRS via `ts-fsrs`, TipTap for the editor, Mistral for the AI
parts, and the Dokploy API for the infrastructure page. Fonts are self hosted:
Google Sans Flex for the sans and Newsreader for the serif, both subset down to
what I actually use.

## Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Dev server                                       |
| `npm run build`        | Production build, runs migrations and seed first |
| `npm run start`        | Production server                                |
| `npm run lint`         | ESLint                                           |
| `npm run db:generate`  | New migration from a schema change               |
| `npm run db:migrate`   | Apply migrations                                 |
| `npm run db:studio`    | Drizzle Studio                                   |
| `npm run db:seed`      | Load `content/` into the database                |
| `npm run db:export`    | Write posts back out to `content/`               |
| `npm run db:sync`      | Merge the local and live databases               |
| `npm run db:sync:test` | Self test for the sync rules                     |
| `npm run lib:export`   | Export the word library                          |

## Logging in

`/admin` and anything that writes are behind a signed session cookie. Sign in at
`/login` with `ADMIN_PASSWORD`. Sessions extend themselves while I am using the
site so the PWA stays logged in, up to a hard limit. Bumping `AUTH_VALID_AFTER`
kicks out every existing session.
