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
    // while the body bg snaps instantly. Recreating a fresh DOM element
    // breaks the animation chain on the prior one, so the notch updates
    // without a transition — but only if there's no other theme-color meta
    // for iOS to fall back to mid-swap, which would seed a fade between the
    // stale color and the new one.
    //
    // Next emits its own theme-color metas from `generateViewport()` inside
    // the ViewportBoundary React tree. Removing them breaks iOS PWA
    // hydration (mobile menu won't open, links don't respond), so suppress
    // them by mutating an attribute that React doesn't reconcile: set
    // `media="not all"` so iOS treats them as inactive while leaving the
    // nodes in place.
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

    // Persist the resolved theme to a cookie so the server can render the
    // correct theme-color meta on the very first byte of the next request —
    // prevents the notch from flashing the OS-default color on refresh.
    document.cookie = `theme-color=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}
