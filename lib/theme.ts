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
 * Kept dependency-free and ES5-ish so it costs nothing to parse and cannot
 * throw its way out of setting the class.
 */
export const THEME_INIT_SCRIPT = `!function(){try{
var d=document.documentElement,s=null;
try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}
var x=s==="light"||s==="dark",
r=x?s:(window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches?"dark":"light");
d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;
var m=document.querySelectorAll('meta[name="theme-color"]'),i,q,t,c;
for(i=0;i<m.length;i++){q=m[i].getAttribute("media");
t=x||!q?r:(q.indexOf("dark")>-1?"dark":"light");
c=t==="dark"?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)};
if(m[i].getAttribute("content")!==c)m[i].setAttribute("content",c)}
}catch(e){}}();`;
