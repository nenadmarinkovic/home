"use client";

import { useSyncExternalStore } from "react";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatDate(d: Date) {
  return DATE_FMT.format(d).replace(",", " ·");
}

function msUntilNextMinute(d: Date) {
  return 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds());
}

function getSnapshot(): number {
  return Math.floor(Date.now() / 60_000);
}

function getServerSnapshot(): number | null {
  return null;
}

function subscribe(onTick: () => void) {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const timeoutId = setTimeout(() => {
    onTick();
    intervalId = setInterval(onTick, 60_000);
  }, msUntilNextMinute(new Date()));
  return () => {
    clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
  };
}

export function LiveClock({ fallback }: { fallback: string }) {
  const minute = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const now = minute === null ? null : new Date();

  return (
    <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] tabular-nums text-foreground/50">
      {now ? formatDate(now) : fallback}
    </p>
  );
}
