"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

const COLORS: Record<"light" | "dark", string> = {
  light: "#fafafa",
  dark: "#000000",
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function activeMeta(metas: HTMLMetaElement[]): HTMLMetaElement | undefined {
  return metas.find((m) => {
    const media = m.getAttribute("media");
    return !media || window.matchMedia(media).matches;
  });
}

export function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme();

  useIsomorphicLayoutEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = COLORS[resolvedTheme];

    const metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const active = activeMeta(metas);
    if (!active) return;

    if (active.content !== color) active.content = color;

    const picked = theme === "light" || theme === "dark";

    if (picked) {
      for (const m of metas) {
        if (m !== active && m.getAttribute("media") !== "not all") {
          m.setAttribute("media", "not all");
        }
      }
    }

    document.cookie = picked
      ? `theme-color=${theme}; path=/; max-age=31536000; samesite=lax`
      : "theme-color=; path=/; max-age=0; samesite=lax";
  }, [theme, resolvedTheme]);

  return null;
}
