export const THEME_STORAGE_KEY = "theme";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export const THEME_COLORS = {
  light: "#fafafa",
  dark: "#000000",
} as const;

export type ResolvedTheme = keyof typeof THEME_COLORS;

function isResolved(value: unknown): value is ResolvedTheme {
  return value === "light" || value === "dark";
}

export function resolveTheme(
  preference: string | null | undefined,
): ResolvedTheme {
  if (isResolved(preference)) return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function applyThemePrefAttribute(
  preference: string | null | undefined,
  doc: Document = document,
): void {
  doc.documentElement.setAttribute(
    "data-theme-pref",
    isResolved(preference) ? preference : "system",
  );
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

export const THEME_INIT_SCRIPT = `!function(){try{
var d=document.documentElement,s=null;
try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}
var p=s==="light"||s==="dark"?s:"system",
r=p==="system"?(window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches?"dark":"light"):p,
c=r==="dark"?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)},
m=document.querySelector('meta[name="theme-color"]');
d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;
d.setAttribute("data-theme-pref",p);
if(m&&m.getAttribute("content")!==c)m.setAttribute("content",c);
}catch(e){}}();`;
