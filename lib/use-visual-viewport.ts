"use client";

import { useSyncExternalStore } from "react";

export type VisualViewportState = {
  height: number;
  offsetTop: number;
  // iOS Safari/standalone PWA does not shrink innerHeight when the software
  // keyboard opens; only visualViewport.height does. A meaningful delta means
  // the keyboard (or some other on-screen widget) is covering content.
  keyboardOpen: boolean;
};

function subscribe(cb: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", cb);
  vv.addEventListener("scroll", cb);
  return () => {
    vv.removeEventListener("resize", cb);
    vv.removeEventListener("scroll", cb);
  };
}

// Cache the last snapshot so getSnapshot returns a stable reference between
// reads (useSyncExternalStore bails out when the result is `Object.is` equal).
let cached: VisualViewportState | null = null;

function getSnapshot(): VisualViewportState | null {
  const vv = typeof window === "undefined" ? null : window.visualViewport;
  if (!vv) return null;
  const next: VisualViewportState = {
    height: vv.height,
    offsetTop: vv.offsetTop,
    keyboardOpen: window.innerHeight - vv.height > 100,
  };
  if (
    cached &&
    cached.height === next.height &&
    cached.offsetTop === next.offsetTop &&
    cached.keyboardOpen === next.keyboardOpen
  ) {
    return cached;
  }
  cached = next;
  return next;
}

function getServerSnapshot(): VisualViewportState | null {
  return null;
}

export function useVisualViewport(): VisualViewportState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
