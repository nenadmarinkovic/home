"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

import {
  applyThemeColorMeta,
  documentMatchesPreference,
  persistThemePreference,
  refreshCachedShell,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme();

  // Runs before paint, so the meta moves in the same frame as the class on
  // <html> rather than a frame behind it.
  useIsomorphicLayoutEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    applyThemeColorMeta(theme, resolvedTheme);
  }, [theme, resolvedTheme]);

  // Deliberately not in the layout effect above: this only needs to be right
  // before the *next* load, and it can kick off a fetch.
  //
  // The bootstrap script already stamps the cookie on every load; repeating it
  // here is what catches a theme change made after the page was parsed. If the
  // document we were served disagrees with the preference — a first visit, or a
  // shell the service worker cached before the cookie existed — the cached copy
  // is rebuilt now so the next launch does not ship a meta scoped to the
  // opposite appearance.
  useEffect(() => {
    // Both triggers are needed. `documentMatchesPreference` looks at the live
    // DOM, which reflects the document *as it was served* — so switching back
    // to a preference the served document happened to match would otherwise
    // leave the cached shell stale with nothing to notice it.
    const changed = persistThemePreference(theme);
    if (changed || !documentMatchesPreference(theme)) refreshCachedShell();
  }, [theme]);

  useEffect(() => {
    // Leftovers from the previous cookie-driven `generateViewport`.
    document.cookie = "theme-color=; path=/; max-age=0; samesite=lax";

    // Restoring from the back/forward cache, or resuming a backgrounded
    // standalone app, can leave iOS painting chrome from the document's
    // original metadata. Re-assert from storage; it is a no-op write unless
    // something actually differs.
    const reassert = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        stored = null;
      }
      applyThemeColorMeta(stored, resolveTheme(stored));
    };

    window.addEventListener("pageshow", reassert);
    document.addEventListener("visibilitychange", reassert);
    return () => {
      window.removeEventListener("pageshow", reassert);
      document.removeEventListener("visibilitychange", reassert);
    };
  }, []);

  return null;
}
