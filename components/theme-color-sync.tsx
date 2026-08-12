"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

import { applyThemeColorMeta, applyThemePrefAttribute } from "@/lib/theme";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme();

  useIsomorphicLayoutEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    applyThemeColorMeta(resolvedTheme);
  }, [resolvedTheme]);

  useIsomorphicLayoutEffect(() => {
    if (theme) applyThemePrefAttribute(theme);
  }, [theme]);

  return null;
}
