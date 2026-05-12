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
    // without a transition.
    //
    // Only manage our own marked meta — leave the metas Next emits from
    // `generateViewport()` alone, since they're part of the React tree and
    // removing them out from under React can break hydration on iOS PWA,
    // which manifests as the mobile menu not opening and links not
    // responding to clicks.
    document
      .querySelectorAll('meta[name="theme-color"][data-tcs]')
      .forEach((m) => m.remove());

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    meta.setAttribute("data-tcs", "1");
    // Prepend so our (no-media) meta wins over Next's media-queried metas
    // when the OS color scheme differs from the in-app theme.
    document.head.insertBefore(meta, document.head.firstChild);

    // Persist the resolved theme to a cookie so the server can render the
    // correct theme-color meta on the very first byte of the next request —
    // prevents the notch from flashing the OS-default color on refresh.
    document.cookie = `theme-color=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}
