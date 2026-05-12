"use client";

import { useEffect, useState } from "react";

export type VisualViewportState = {
  height: number;
  offsetTop: number;
  // iOS Safari/standalone PWA does not shrink innerHeight when the software
  // keyboard opens; only visualViewport.height does. A meaningful delta means
  // the keyboard (or some other on-screen widget) is covering content.
  keyboardOpen: boolean;
};

function read(): VisualViewportState | null {
  if (typeof window === "undefined") return null;
  const vv = window.visualViewport;
  if (!vv) return null;
  return {
    height: vv.height,
    offsetTop: vv.offsetTop,
    keyboardOpen: window.innerHeight - vv.height > 100,
  };
}

export function useVisualViewport(): VisualViewportState | null {
  const [state, setState] = useState<VisualViewportState | null>(read);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      setState(read());
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
