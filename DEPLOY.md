# Going live on nenadmarinkovic.com

The site already runs on the Hetzner VPS under Dokploy, served at
`home-preview.monolinie.com`. This is the checklist for turning that preview into
the production site.

## 1. DNS

At the registrar for `nenadmarinkovic.com`, point the apex and `www` at the VPS:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` | *VPS IPv4* |
| `AAAA` | `@` | *VPS IPv6* (if enabled) |
| `CNAME` | `www` | `nenadmarinkovic.com.` |

`bim` already resolves to the same server; leave it alone.

Wait for propagation before adding the domain in Dokploy — Let's Encrypt issues
the certificate over HTTP-01 and fails if the record has not landed yet.

```bash
dig +short nenadmarinkovic.com
dig +short www.nenadmarinkovic.com
```

## 2. Dokploy domains

On the www application → **Domains**:

1. Add `nenadmarinkovic.com`, port `3000`, HTTPS on, certificate **Let's Encrypt**.
2. Add `www.nenadmarinkovic.com` the same way — Traefik needs its own cert for
   the redirect host to serve HTTPS at all.
3. Keep `home-preview.monolinie.com` attached for one deploy cycle as a fallback,
   then remove it (or redirect it, below).

Redirects, as a Traefik middleware on the application:

- `www.nenadmarinkovic.com` → `nenadmarinkovic.com` (301, `redirectregex`)
- `home-preview.monolinie.com` → `nenadmarinkovic.com` (301) once you are happy

## 3. Environment

Production env on the Dokploy application. Everything not listed here keeps its
current value.

```env
NEXT_PUBLIC_SITE_URL=https://nenadmarinkovic.com
DATABASE_PATH=/app/data/articles.db
EMBED_APPS=bim=https://bim.nenadmarinkovic.com
```

`NEXT_PUBLIC_SITE_URL` overrides `lib/site.ts`, which now defaults to the
production domain — canonical URLs, OpenGraph, RSS, sitemap and robots all read
from it. Set it on the preview deployment too, so a staging copy never emits
production URLs.

`EMBED_APPS` is both the name→origin map used by the `embed` and `device` fences
**and** the allowlist the article page uses to accept `postMessage` from a
framed app. An app that is not listed there is inert.

On the **bim** application, allow this site to frame it:

```env
EMBED_PARENTS=https://nenadmarinkovic.com
```

Keep `http://localhost:3000` in bim's local `.env.local` for development.

## 4. Persistent storage

Two volumes must survive a redeploy — both are git-ignored and neither is
rebuilt from the image:

| Mount | Holds |
| --- | --- |
| `/app/data` | `articles.db` — articles, links, and the word library |
| `/app/uploads` | images uploaded from the article editor |

`prebuild` and `prestart` run `scripts/migrate.mjs` then `scripts/seed.mjs`, so
migrations apply on every deploy and any Markdown in `content/` is seeded with
`INSERT OR IGNORE`. `content/` is currently empty, so the seed is a no-op and the
volume is the only source of articles.

## 5. Backups

The database is a single file, so a nightly snapshot is enough. On the VPS:

```bash
sqlite3 /path/to/volume/articles.db \
  ".backup '/var/backups/www/articles-$(date +%F).db'"
```

Use `.backup` (or `VACUUM INTO`), not `cp` — the database runs in WAL mode and a
plain copy can catch a torn write. Keep it in a cron entry with a
`find /var/backups/www -mtime +30 -delete` sweep, and pull a copy off the box.

## 6. After the first production deploy

- `https://nenadmarinkovic.com/robots.txt` — allows `/`, blocks `/admin`,
  `/api`, `/login`, `/mockup`, `/offline`
- `https://nenadmarinkovic.com/sitemap.xml` — home, `/writing`, `/links`,
  `/contact`, plus every published article
- `https://nenadmarinkovic.com/rss.xml` — absolute URLs on the new domain
- Log in at `/login`, confirm the session cookie sticks (it is `Secure`, so this
  only works over HTTPS)
- Install the PWA and confirm the service worker registers on the new origin —
  the old origin's worker is a separate registration and simply goes stale
- Point the browser extensions at the new host and re-check the links API token
  in the `settings` table
- Open an article containing an `embed` or `device` fence and confirm bim loads
  and follows the theme toggle
