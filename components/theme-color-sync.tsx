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

    if (!document.querySelector('meta[name="theme-color"]:not([media])')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }

    // Persist the resolved theme to a cookie so the server can render the
    // correct theme-color meta on the very first byte of the next request —
    // prevents the notch from flashing the OS-default color on refresh.
    document.cookie = `theme-color=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}
