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

**Under `statusBarStyle: "default"` the page cannot paint the notch strip at
all.** The web view starts below it and iOS draws it. That single fact bounds
what any amount of CSS or meta work can achieve: the page controls that strip
only *after* iOS has read a colour out of the document, never before. The one
style that would hand the strip to the page is `black-translucent`, and it
forces white status-bar glyphs, so it is unusable for a theme that can be
light. Do not "fix" a launch flash by reaching for it.

An open case, recorded so the next person does not re-derive it: light phone,
light app, iOS 18.4.1, black notch strip on standalone launch only — down from
about a second to roughly one frame once shell navigations became cache-first,
which is the shape you would expect if the remaining window is iOS drawing the
strip before any document exists. Eliminated by inspection: `theme-color` (no
meta resolves to black under a light appearance), the manifest (`theme_color`
and `background_color` have been `#fafafa` since the file was created), Safari
26 sampling (not on 18.x), a Next upgrade swapping the capability meta (pinned
to 16.2.4 throughout), and anything black in the page itself (no `bg-foreground`
or equivalent near the top; the fixed/sticky audit comes back empty).

What is left is iOS's install-time cache. A home-screen web app keeps the
manifest and status-bar style captured when it was added and never re-reads
them, so an app added before `theme_color` existed in the manifest (2026-07-01)
— or while `statusBarStyle` was briefly `black-translucent`, as it was for part
of 2026-07-17 — launches with those values forever. That is consistent with
every constraint here: strip only, one frame, standalone only, and immune to
deploys. Removing and re-adding the app is the test, and no deploy substitutes
for it.

The only remaining lever after that is `apple-touch-startup-image`, which
replaces the generated launch screen with images that cover the strip. It costs
a matrix of exact-size PNGs per device, keys off `prefers-color-scheme` so it
cannot express "light app on a dark phone", and only helps if the flash is the
launch screen rather than the hand-off to the web view. Confirm which before
building it.

Note that `#61` fixed this correctly and it appeared to regress weeks later
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
