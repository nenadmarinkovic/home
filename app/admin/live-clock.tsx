"use client";

import { useSyncExternalStore } from "react";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
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
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-sans text-xs font-medium uppercase tracking-[0.2em] tabular-nums text-zinc-500 dark:text-zinc-500">
      <span>{now ? formatDate(now) : fallback}</span>
      {now && (
        <>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <span className="font-semibold text-[#ff000e] dark:text-[#ffff01]">
            {TIME_FMT.format(now)}
          </span>
        </>
      )}
    </p>
  );
}
