<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# iOS status bar / notch colour

`lib/theme.ts` owns this. `npm run theme:test` covers the logic; pass
`-- --url=http://localhost:3000` against a running build to also assert the
rendered document. These rules keep the notch from flashing the wrong colour:

1. **The bootstrap script in `<head>` must stay a plain inline `<script>`.**
   `next/script` with `strategy="beforeInteractive"` looks equivalent but is
   serialised into `self.__next_s` and only runs once Next's async runtime
   chunk has executed — hundreds of milliseconds after iOS has already painted
   the status bar. It must also stay *after* the `theme-color` meta.
2. **The document ships exactly one `theme-color` meta, un-scoped, always the
   light colour**, and the bootstrap script rewrites it. Never a media-scoped
   pair: on a dark-appearance phone running the app in light, the dark-media
   meta *matches*, and during a standalone launch the status bar is already on
   screen over the splash, so iOS tints it black before the script can correct
   it. Defaulting to light rather than dark also means the worst case is the
   light tint held a frame too long, never a dark flash.
3. **The server bakes no theme into the HTML.** Every response is identical
   whatever the visitor prefers, which is what makes rule 4 safe. A previous
   version chose the meta server-side from a `theme-pref` cookie and needed a
   cookie re-stamp on every load plus a `refresh-shell` message to rebuild
   cached copies; it is not worth it, and WebKit's seven-day cap on
   script-written cookies made it fail open on exactly the wrong side.
4. **The service worker answers shell navigations from cache first**, so a cold
   standalone launch does not wait on a round trip plus a dynamic render. This
   is a launch-speed win, not a colour fix, and it stays correct only as long as
   rule 3 holds.
5. **`--background` must be opaque on both `html` and `body`, with no
   transition.** Safari 26 dropped `theme-color` and samples the page instead
   (body, falling back to html), watching it live. A transition there makes the
   notch visibly lag the rest of the UI.
6. **Careful with `position: fixed` / `sticky` elements at the top of the
   viewport.** Safari 26 prefers them over `body` when picking the tint if they
   are within ~4px of the top, at least 80% of the viewport wide, and at least
   3px tall. Either give such an element `background-color: var(--background)`
   or make it ineligible (a `backdrop-filter` disqualifies it — which is why
   the dialog and sheet overlays are safe).

Also keep `THEME_COLORS` in `lib/theme.ts` identical to `--background` in
`app/globals.css`; the self-test fails if they drift.

## Reading a notch report

This has now been "fixed" three times, and twice the diagnosis was wrong because
the mechanism was assumed rather than checked. **Get the iOS version first** —
it decides which of two unrelated systems you are debugging:

- **iOS ≤ 18** (including 18.4.x): the notch is painted from `theme-color`, and
  iOS *animates* the strip on every change. Rules 1-4 above are the live ones;
  the background chain is inert.
- **iOS 26+**: Safari parses `theme-color` and ignores it, deriving the tint
  from the page's own `background-color` instead. Rules 5-6 become the live
  ones and every `theme-color` lever turns into a no-op at once.

**Then get the phone's appearance.** On iOS ≤ 18 the notch is whatever
`theme-color` resolves to. Since the document now ships a single un-scoped
`#fafafa` meta, black can only ever appear *after* the bootstrap script has run
and resolved to dark — i.e. only when the app itself is in dark mode. A black
notch on a light app, on a phone of either appearance, is therefore **not**
coming from the document, and no amount of meta work will touch it. That was not
true before: the old media-scoped pair let a dark-appearance phone match the
dark meta during parse.

## Why `statusBarStyle` is `black-translucent`

**Under `default` the page cannot paint the notch strip at all.** The web view
starts below it and iOS draws it, from the *system* appearance, during the
launch window when no document exists yet. That bounds what any meta or CSS
work can achieve, and it is what every earlier fix ran into: cache-first shell
navigations took the flash from about a second to roughly one frame, but could
not close it, because you cannot colour a window that has no document in it.

`black-translucent` is the only style that hands the strip to the page. The web
view then runs to the top of the screen: the launch screen's `background_color`
covers the strip, and after hand-off the fixed mask in `app/layout.tsx` does,
in `var(--background)`. The strip follows the *app's* theme rather than the
OS's, which is the whole point.

Its cost is real and is the reason it was reverted within hours on 2026-07-17:
it makes the status-bar glyphs white, which on `#fafafa` is unreadable. Whether
they are *forced* white or follow the appearance varies by iOS version — check
on a device before assuming either. If they come out white, the honest options
are reverting to `default` (and accepting the launch strip) or
`apple-touch-startup-image`, which replaces the generated launch screen with
exact-size PNGs per device; it keys off `prefers-color-scheme`, so it cannot
express "light app on a dark phone", and it only helps if the flash is the
launch screen rather than the hand-off to the web view.

**Do not re-derive the install-cache theory.** A home-screen web app does keep
the manifest and status-bar style captured at add time and never re-reads them,
so a reinstall is always step one when judging a deploy. But for the standing
case — light app, black strip on standalone launch only — a reinstall was
performed on 2026-08-12 and **the flash survived it**. That eliminates the
install-time cache, along with (by inspection) `theme-color` (no meta resolves
to black once the document ships a single `#fafafa` one), the manifest
(`theme_color` and `background_color` `#fafafa` since the file was created),
Safari 26 sampling (not on 18.x), a Next upgrade swapping the capability meta
(pinned to 16.2.4 throughout), and anything black in the page itself.

Note that `#61` fixed this correctly and it appeared to regress weeks later
with no commit to blame — the pipeline was byte-identical, comments aside. When
nothing in the diff explains it, suspect the phone, not the repo.

Two things still cannot be fixed from here: whatever iOS captured when the app
was added to the Home Screen (only a reinstall clears it), and a new build
starting with empty caches, so the *first* launch after a deploy still goes to
the network. Always relaunch twice before judging a change, and reinstall
before concluding a deploy did not work.

`npm run theme:test` and the browser checks behind it run on Chromium, which
paints no status bar and implements none of Safari 26's sampling. They verify
the mechanism, never the platform. Real verification needs an iPhone.

# Fonts and first paint

Two rules, both enforced by `npm run theme:test`:

1. **Every `@font-face` stays `font-display: optional`.** `swap` on any one of
   them lets that face land after first paint and reflow the text. The copy uses
   `text-balance` and `text-pretty`, so a reflow does not nudge a word — it
   recomputes line breaks and shifts whole paragraphs. `optional` never swaps:
   the font is used if it is ready at first paint, otherwise the fallback holds
   for that load.
2. **Every face is in `PRECACHE_FONTS` in `public/sw.js`.** `optional` is only
   pleasant if "ready at first paint" is the normal case.

Rule 2 is the one that is easy to get wrong, and it is a general trap rather
than a font one: **the service worker answers shell navigations from cache in
about a millisecond, so anything first paint depends on has to come from cache
too.** Fonts were left on the network path when that landed, which turned a race
they had always won by default into one they started losing — `optional` spent
its ~100ms block period on screen instead of behind a web view that had nothing
to paint yet. Nothing about the fonts changed; the thing they were racing got a
thousand times faster. Apply the same reasoning to any asset added later.

## Never run `next start` on the dev port

`ServiceWorkerRegister` bails out unless `NODE_ENV === "production"`, so `npm run
dev` never registers a worker — but service workers are scoped to an *origin*,
not to a server. One `npm run start` on `localhost:3000` installs a real worker
there, and it keeps intercepting when you go back to `npm run dev` on the same
port, serving the production build's HTML and `/_next/static/` chunks over your
dev server. The symptom is an error that will not change no matter what you
edit — classically a hydration mismatch whose stack line numbers point at a
version of the file that no longer exists.

Verify a production build on a different port (`next start -p 3001`), or clear
it afterwards: DevTools → Application → Storage → Clear site data, or

```js
navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
```

A hard reload now bypasses every cache in `sw.js` (`isForcedRefresh`), so it is
an escape hatch rather than a re-serve of the same stale bytes.

Fonts are served cache-first and never revalidated, like `/_next/static/`.
Their filenames are not content-hashed, but `next.config.ts` already serves
`/fonts/:path*` as `immutable, max-age=31536000`, so renaming the file was
always the only way to ship a different font.
