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

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]:not([media])',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
