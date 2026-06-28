"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      // Tag the worker URL with the build id so each deploy registers a
      // distinct worker, forcing it to reinstall and drop the prior build's
      // caches (see public/sw.js). Without this, a stale cached app shell can
      // be served against missing JS chunks and the page never hydrates.
      const buildId = process.env.NEXT_PUBLIC_BUILD_ID;
      const url = buildId
        ? `/sw.js?v=${encodeURIComponent(buildId)}`
        : "/sw.js";
      navigator.serviceWorker
        .register(url, { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Registration is best-effort — failures shouldn't break the app.
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
