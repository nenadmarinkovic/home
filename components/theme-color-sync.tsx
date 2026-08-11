"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

import { applyThemeColorMeta } from "@/lib/theme";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  // Before paint, so the meta moves in the same frame as the class on <html>
  // rather than a frame behind it.
  useIsomorphicLayoutEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    applyThemeColorMeta(resolvedTheme);
  }, [resolvedTheme]);

  return null;
}
