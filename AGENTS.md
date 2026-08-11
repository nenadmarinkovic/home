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
   the status bar. It must also stay *after* the `theme-color` metas.
2. **An explicit theme ships exactly one un-scoped `theme-color` meta**, chosen
   server-side from the `theme-pref` cookie (`themeColorMetas`). Shipping both
   media-scoped metas is only correct for "system": on a dark phone running the
   app in light, the dark-media meta *matches*, and during a standalone launch
   the status bar is already on screen over the splash, so iOS can tint it
   black before the bootstrap script gets to correct it. The cookie is free
   here — the layout already reads cookies for auth.
3. **The service worker answers shell navigations from cache first**, so a cold
   standalone launch does not wait on a round trip plus a dynamic render. This
   is a launch-speed win, not a colour fix — but it interacts with rule 2, and
   that part *is* a colour fix: the cached HTML carries whatever colour the
   cookie had when it was cached, so a copy taken before the cookie existed
   keeps shipping the wrong meta. `ThemeColorSync` compares the document it was
   served against the preference and posts `refresh-shell` on a mismatch;
   changing a theme does the same. If you change one side, change the other.
4. **`--background` must be opaque on both `html` and `body`, with no
   transition.** Safari 26 dropped `theme-color` and samples the page instead
   (body, falling back to html), watching it live. A transition there makes the
   notch visibly lag the rest of the UI.
5. **Careful with `position: fixed` / `sticky` elements at the top of the
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
  iOS *animates* the strip on every change. Rules 1-3 above are the live ones;
  the background chain is inert.
- **iOS 26+**: Safari parses `theme-color` and ignores it, deriving the tint
  from the page's own `background-color` instead. Rules 4-5 become the live
  ones and every `theme-color` lever turns into a no-op at once.

**Then get the phone's appearance**, because it decides whether the document
can even be responsible. On iOS ≤ 18 the notch is whatever the first matching
`theme-color` resolves to, and the only value here that is black is the *dark*
one. On a **light**-appearance phone nothing on the page can resolve to it —
the light-media meta is `#fafafa` and the cookie-driven single meta is
`#fafafa` — so a black notch there is **not** coming from this repo, and no
amount of meta or cookie work will touch it. On a dark-appearance phone it can:
the dark-media meta matches during parse and iOS tints from it before the
bootstrap script corrects it, which means the `theme-pref` cookie was missing.

An open case, recorded so the next person does not re-derive it: light phone,
light app, iOS 18.4.1, black notch for about a second on standalone launch
only. Eliminated by inspection — `theme-color` (no meta resolves to black under
a light appearance), the manifest (`theme_color` and `background_color` have
been `#fafafa` since the file was created), Safari 26 sampling (not on 18.x),
and a Next upgrade swapping the capability meta (pinned to 16.2.4 throughout).
What is *not* eliminated is iOS's install-time cache: a home-screen web app
keeps the manifest and status-bar style captured when it was added, so an app
installed while `statusBarStyle` was briefly `black-translucent` (it was, for
part of 2026-07-17) launches with that forever. Removing and re-adding the app
is the cheap test, and no deploy can substitute for it.

Two failure modes that make the cookie vanish, both already guarded, both easy
to reintroduce:

- **Writing it only when the value changes.** WebKit caps script-written
  cookies at seven days regardless of `max-age`, so a cookie that is not
  re-stamped expires on its own and the server silently falls back to
  media-scoped metas. It is re-stamped from the bootstrap script on every load
  for exactly this reason.
- **Serving a cached shell that predates it.** The HTML carries the cookie's
  colour, so a copy the service worker cached before the cookie existed keeps
  shipping the wrong meta. `ThemeColorSync` compares what it was served against
  what the preference implies and rebuilds the cache on a mismatch.

Also note that `#61` fixed this correctly and it appeared to regress weeks later
with no commit to blame — the pipeline was byte-identical, comments aside. When
nothing in the diff explains it, suspect the phone, not the repo.

Three things that cannot be fixed from here: whatever iOS captured when the app
was added to the Home Screen (only a reinstall clears it); OS-drawn launch
artifacts, which follow the system appearance rather than the app's theme
(`apple-touch-startup-image` keys off `prefers-color-scheme`, so it cannot
express "the app is light on a dark phone"); and a new build starting with
empty caches, so the *first* launch after a deploy still goes to the network.
Always relaunch twice before judging a change, and reinstall before concluding
a deploy did not work.

`npm run theme:test` and the browser checks behind it run on Chromium, which
paints no status bar and implements none of Safari 26's sampling. They verify
the mechanism, never the platform. Real verification needs an iPhone.
