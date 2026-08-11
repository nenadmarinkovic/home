"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

import {
  applyThemeColorMeta,
  persistThemePreference,
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
  useEffect(() => {
    persistThemePreference(theme);
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
