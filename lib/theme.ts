/**
 * Single source of truth for the two colours the UI can ever be, and for the
 * logic that keeps three separate things in agreement:
 *
 *   1. the `dark` / `light` class on <html> (drives every CSS variable),
 *   2. `color-scheme` on <html> (drives UA-painted surfaces: scrollbars,
 *      form controls, and the canvas before our CSS applies),
 *   3. the `theme-color` <meta> tags (drive the iOS status bar / notch on
 *      Safari <= 18 and Android Chrome).
 *
 * On iOS 26+ Safari ignores `theme-color` entirely and samples the page's own
 * `background-color` (body, falling back to html) instead, so `--background`
 * being correct at first paint matters just as much as the meta tags.
 */

export const THEME_STORAGE_KEY = "theme";

/**
 * Mirrors `THEME_STORAGE_KEY` so the server can emit the right meta on the
 * first byte. See `themeColorMetas` for why that matters.
 */
export const THEME_COOKIE = "theme-pref";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Must stay identical to `--background` in `:root` / `.dark` in globals.css.
 * `scripts/theme-selftest.mjs` asserts that they have not drifted apart.
 */
export const THEME_COLORS = {
  light: "#fafafa",
  dark: "#000000",
} as const;

export type ResolvedTheme = keyof typeof THEME_COLORS;

export type ThemePreference = ResolvedTheme | "system";

function isResolved(value: unknown): value is ResolvedTheme {
  return value === "light" || value === "dark";
}

/**
 * The `theme-color` metas to render, given the preference cookie.
 *
 * For "system" (and for a first-ever visit) two media-scoped metas are exactly
 * right, and need no JavaScript at all. For an explicit choice they are not:
 * on a dark phone running the app in light mode, the dark-media meta *matches*,
 * and during a standalone launch the status bar is already on screen over the
 * splash — so iOS can tint it black the moment it parses that meta, well before
 * the bootstrap script at the end of <head> gets to correct it. Emitting a
 * single un-scoped meta means there is never a wrong value in the document to
 * be caught by.
 *
 * This costs nothing: the root layout already reads cookies for auth, so every
 * route renders per-request regardless.
 */
export function themeColorMetas(
  preference: string | null | undefined,
): Array<{ media?: string; content: string }> {
  if (isResolved(preference)) return [{ content: THEME_COLORS[preference] }];
  return [
    { media: "(prefers-color-scheme: light)", content: THEME_COLORS.light },
    { media: DARK_MEDIA_QUERY, content: THEME_COLORS.dark },
  ];
}

/**
 * Re-stamp the cookie. Unconditionally, on every load — never "only when it
 * changed".
 *
 * WebKit's tracking prevention caps the lifetime of any cookie written from
 * script at seven days, whatever `max-age` says. A cookie that is only written
 * when the value changes therefore disappears on its own, and the server
 * quietly goes back to emitting media-scoped metas — which is precisely the
 * state that paints a black notch on a light app. Re-stamping on every load
 * keeps the clock reset for anyone who opens the app at least weekly.
 *
 * Returns whether the value actually changed, which is a separate question from
 * whether the cookie was written.
 */
export function persistThemePreference(preference: string | null | undefined): boolean {
  if (typeof document === "undefined") return false;

  const value = isResolved(preference) ? preference : "";
  const current =
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${THEME_COOKIE}=`))
      ?.slice(THEME_COOKIE.length + 1) ?? "";

  document.cookie = value
    ? `${THEME_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`
    : `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;

  return current !== value;
}

/**
 * Does the document we were actually served already carry the metas the server
 * would emit for this preference?
 *
 * Only the media *shape* is compared — contents get rewritten in place by the
 * bootstrap script, so they always agree; what matters is whether a meta scoped
 * to the opposite appearance exists at all for iOS to latch onto mid-parse.
 * A mismatch means the HTML predates the cookie (a first visit, or a shell the
 * service worker cached before one existed), so the cached copy needs redoing
 * before the next launch.
 */
export function documentMatchesPreference(
  preference: string | null | undefined,
  doc: Document = document,
): boolean {
  const metas = Array.from(doc.querySelectorAll('meta[name="theme-color"]'));
  const expected = themeColorMetas(preference);
  if (metas.length !== expected.length) return false;
  return expected.every(
    (want, i) => (metas[i].getAttribute("media") ?? undefined) === want.media,
  );
}

export function refreshCachedShell(): void {
  if (typeof navigator === "undefined") return;
  navigator.serviceWorker?.controller?.postMessage({ type: "refresh-shell" });
}

/** Turn a stored preference (possibly absent or garbage) into a real theme. */
export function resolveTheme(preference: string | null | undefined): ResolvedTheme {
  if (isResolved(preference)) return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

/**
 * Point every `theme-color` meta at the right colour.
 *
 * The markup ships two media-scoped metas so a JS-free load still tracks the
 * OS. When the visitor has picked an explicit theme we set *both* metas to
 * that colour rather than disabling one of them: whichever media query the OS
 * matches then yields the same answer, and switching back to "system" simply
 * restores the per-media colours. Mutating the `media` attribute instead (as
 * the previous implementation did) was one-way — going back to "system"
 * left a meta permanently disabled.
 */
export function applyThemeColorMeta(
  preference: string | null | undefined,
  resolved: ResolvedTheme,
  doc: Document = document,
): void {
  const explicit = isResolved(preference);
  const metas = doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  for (const meta of Array.from(metas)) {
    const media = meta.getAttribute("media");
    let scheme: ResolvedTheme;
    if (explicit || !media) {
      scheme = resolved;
    } else {
      scheme = media.includes("dark") ? "dark" : "light";
    }
    const color = THEME_COLORS[scheme];
    if (meta.getAttribute("content") !== color) meta.setAttribute("content", color);
  }
}

/** Mirror what next-themes does to <html>, so we can do it before it hydrates. */
export function applyThemeClass(resolved: ResolvedTheme, doc: Document = document): void {
  const root = doc.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

/**
 * Render-blocking bootstrap, inlined into <head> *after* the theme-color metas.
 *
 * This has to be a plain inline <script> rather than `next/script`
 * `beforeInteractive`: in the App Router the latter is serialised into the
 * `self.__next_s` queue and only runs once Next's async runtime chunk has
 * downloaded and executed. That is tens to hundreds of milliseconds after the
 * status bar has already been painted from the un-corrected meta — which is
 * exactly the black-notch-on-light-theme flash.
 *
 * It also re-stamps the preference cookie, which is what lets the *next* load
 * ship a single correct meta rather than a pair the wrong half of which can
 * match. Doing it here rather than from React means it happens on every load,
 * before hydration, so WebKit's seven-day cap on script-written cookies never
 * gets a chance to expire it.
 *
 * Kept dependency-free and ES5-ish so it costs nothing to parse and cannot
 * throw its way out of setting the class.
 */
export const THEME_INIT_SCRIPT = `!function(){try{
var d=document.documentElement,s=null;
try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}
var x=s==="light"||s==="dark",
r=x?s:(window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches?"dark":"light");
d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;
try{document.cookie=(x?${JSON.stringify(THEME_COOKIE)}+"="+r+"; max-age=31536000":${JSON.stringify(THEME_COOKIE)}+"=; max-age=0")+"; path=/; samesite=lax"}catch(e){}
var m=document.querySelectorAll('meta[name="theme-color"]'),i,q,t,c;
for(i=0;i<m.length;i++){q=m[i].getAttribute("media");
t=x||!q?r:(q.indexOf("dark")>-1?"dark":"light");
c=t==="dark"?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)};
if(m[i].getAttribute("content")!==c)m[i].setAttribute("content",c)}
}catch(e){}}();`;
