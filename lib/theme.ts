/**
 * The two colours the UI can ever be, plus the little logic that keeps the
 * `light`/`dark` class, `color-scheme`, and the `theme-color` meta agreeing.
 *
 * iOS <= 18 paints the status bar from `theme-color`; iOS 26+ ignores it and
 * samples the page's own `background-color` (body, falling back to html).
 * Keeping THEME_COLORS identical to `--background` covers both.
 */

export const THEME_STORAGE_KEY = "theme";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** Must stay identical to `--background` in `:root` / `.dark` in globals.css. */
export const THEME_COLORS = {
  light: "#fafafa",
  dark: "#000000",
} as const;

export type ResolvedTheme = keyof typeof THEME_COLORS;

function isResolved(value: unknown): value is ResolvedTheme {
  return value === "light" || value === "dark";
}

export function resolveTheme(preference: string | null | undefined): ResolvedTheme {
  if (isResolved(preference)) return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function applyThemeColorMeta(
  resolved: ResolvedTheme,
  doc: Document = document,
): void {
  const color = THEME_COLORS[resolved];
  const meta = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta && meta.getAttribute("content") !== color) {
    meta.setAttribute("content", color);
  }
}

/**
 * Render-blocking bootstrap, inlined into <head> right after the theme-color
 * meta so it can correct it before first paint.
 *
 * Two things here are load-bearing:
 *
 * - It must be a plain inline <script>, not `next/script`
 *   `strategy="beforeInteractive"`. In the App Router the latter is serialised
 *   into `self.__next_s` and only runs once Next's async runtime chunk has
 *   downloaded — long after iOS has tinted the status bar.
 * - The document ships exactly one un-scoped meta, always the light colour, and
 *   this rewrites it. A pair of media-scoped metas would mean that on a
 *   dark-appearance phone running the app in light, the dark one *matches*
 *   during parse and iOS can tint the notch black before this runs.
 */
export const THEME_INIT_SCRIPT = `!function(){try{
var d=document.documentElement,s=null;
try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}
var r=s==="light"||s==="dark"?s:(window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches?"dark":"light"),
c=r==="dark"?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)},
m=document.querySelector('meta[name="theme-color"]');
d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;
if(m&&m.getAttribute("content")!==c)m.setAttribute("content",c);
}catch(e){}}();`;
