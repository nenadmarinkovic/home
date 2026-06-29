"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      const buildId = process.env.NEXT_PUBLIC_BUILD_ID;
      const url = buildId
        ? `/sw.js?v=${encodeURIComponent(buildId)}`
        : "/sw.js";
      navigator.serviceWorker
        .register(url, { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
