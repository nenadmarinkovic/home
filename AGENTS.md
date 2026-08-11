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
3. **The service worker answers shell navigations from cache first.** A cold
   standalone launch used to wait on a round trip plus a dynamic render, and
   iOS fills the status bar from the *system appearance* while the web view is
   blank. Since the cached HTML carries the cookie's colour, `ThemeToggle` →
   `persistThemePreference` posts `refresh-shell` so the cache is re-fetched
   with the new cookie. If you change one side, change the other.
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

## Why this regressed once, and how to not chase it again

This was fixed properly in #61 and came back weeks later with **no commit to
blame** — the pipeline was byte-identical, comments aside. What changed was the
phone, not the repo.

#61 was built for iOS ≤ 18, where the notch is painted from `theme-color` and
iOS *animates* the strip on every change. Its whole strategy was to write that
meta as few times as possible. Safari 26 then stopped using `theme-color`
altogether — it still parses the tag and ignores the value, deriving the tint
from the page's own `background-color` instead. Every lever #61 tuned became a
no-op at once, and the notch fell through to a mechanism nothing had addressed.

So when the notch misbehaves, check in this order and resist the pull of the
`theme-color` code — on any current iPhone it is not what you are looking at:

1. **The background chain** (rules 4 and 5 above). This is the live mechanism on
   iOS 26+. `theme-color` now only serves iOS ≤ 18 and Android Chrome.
2. **The pre-document window.** On a cold standalone launch the app spends most
   of its first second with no document, and iOS fills the status bar from the
   *system appearance* meanwhile. Nothing in the HTML can colour a window with
   no HTML in it — which is why shell navigations are cache-first (rule 3).
   Measured with the document request stalled: 8190 ms → ~75 ms to first paint.
3. **Only then the metas.**

Two things that are not bugs and cannot be fixed from here: if the phone is in
Dark appearance and the app is forced to Light, the OS-drawn launch artifacts
follow the system and no API reaches them (`apple-touch-startup-image` keys off
`prefers-color-scheme`, so it would be dark in exactly that case); and a new
build starts with empty caches, so the *first* launch after a deploy still goes
to the network. Always relaunch twice before judging a change.

Note that `npm run theme:test` and the browser checks behind it run on Chromium,
which implements none of Safari 26's sampling. They verify the mechanism the
rules describe, not the rules themselves. Real verification needs an iPhone.
