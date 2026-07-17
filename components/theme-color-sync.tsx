"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

const COLORS: Record<"light" | "dark", string> = {
  light: "#fafafa",
  dark: "#000000",
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useIsomorphicLayoutEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = COLORS[resolvedTheme];

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    meta.setAttribute("data-tcs", "1");
    document.head.insertBefore(meta, document.head.firstChild);

    document
      .querySelectorAll('meta[name="theme-color"]:not([data-tcs])')
      .forEach((m) => {
        if (m.getAttribute("media") !== "not all") {
          m.setAttribute("media", "not all");
        }
      });

    document
      .querySelectorAll('meta[name="theme-color"][data-tcs]')
      .forEach((m) => {
        if (m !== meta) m.remove();
      });

    document.cookie = `theme-color=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}
