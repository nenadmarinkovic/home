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
