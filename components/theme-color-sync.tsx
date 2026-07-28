"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect } from "react";

const COLORS: Record<"light" | "dark", string> = {
  light: "#fafafa",
  dark: "#000000",
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The browser paints the first theme-color meta whose media query matches, so
// that element is the only one whose content can change what is on screen.
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

    // Touch the DOM only when the painted color would actually change. iOS
    // animates the status bar on every theme-color change, and this effect runs
    // at hydration — after first paint — so any unconditional write (or
    // swapping the meta for an identical one) reads as a color transition in
    // the strip above the header every time the app is opened.
    if (active.content !== color) active.content = color;

    const picked = theme === "light" || theme === "dark";

    // With an explicit pick, neutralize the losing metas so a later change of
    // OS appearance cannot hand the win to one carrying the system color. On
    // "system" they are left alone: they already resolve correctly on their own.
    if (picked) {
      for (const m of metas) {
        if (m !== active && m.getAttribute("media") !== "not all") {
          m.setAttribute("media", "not all");
        }
      }
    }

    // The cookie tells generateViewport to server-render a single theme-color.
    // It records the *pick*, never the resolved value: caching "light" for a
    // system-theme user leaves the markup stale as soon as they change OS
    // appearance, and correcting that on the client is exactly the post-paint
    // fade this component exists to avoid. No pick means no cookie, and the
    // media-scoped metas stay authoritative.
    document.cookie = picked
      ? `theme-color=${theme}; path=/; max-age=31536000; samesite=lax`
      : "theme-color=; path=/; max-age=0; samesite=lax";
  }, [theme, resolvedTheme]);

  return null;
}
