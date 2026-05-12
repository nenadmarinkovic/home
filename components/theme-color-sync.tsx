"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const COLORS: Record<"light" | "dark", string> = {
  light: "#f5f4f0",
  dark: "#0c1115",
};

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = COLORS[resolvedTheme];

    // Overwrite every theme-color meta (including the media-targeted ones from
    // viewport config). Otherwise Safari follows the OS color-scheme media query
    // and ignores the in-app theme toggle, leaving the notch the wrong color.
    const metas = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    metas.forEach((meta) => {
      meta.content = color;
    });

    // Ensure at least one no-media meta exists so the value persists if all
    // media-targeted ones were removed.
    if (!document.querySelector('meta[name="theme-color"]:not([media])')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [resolvedTheme]);

  return null;
}
