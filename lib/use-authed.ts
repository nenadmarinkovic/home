"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuthed(): boolean {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { authed: false }))
      .then((data: { authed?: boolean }) => {
        if (!cancelled) setAuthed(Boolean(data?.authed));
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return authed;
}
