"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

import {
  applyThemeColorMeta,
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

  useEffect(() => {
    // The old cookie-driven `generateViewport` is gone; drop its leftovers so
    // they stop riding along on every request.
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
