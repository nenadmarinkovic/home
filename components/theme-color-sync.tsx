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

    // iOS Safari natively animates `theme-color` content-attribute changes,
    // which makes the iPhone notch fade between colors in standalone PWA mode
    // while the body bg snaps instantly. Removing the existing metas and
    // appending a fresh one breaks the animation chain on the prior element,
    // so the notch updates without a transition.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.remove());

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);

    // Persist the resolved theme to a cookie so the server can render the
    // correct theme-color meta on the very first byte of the next request —
    // prevents the notch from flashing the OS-default color on refresh.
    document.cookie = `theme-color=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}
