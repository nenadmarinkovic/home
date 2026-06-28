import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You appear to be offline.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-6 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Offline
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          You&apos;re offline.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Some things still work — pages you&apos;ve already visited and your
          vocabulary review are here. Anything that needs a live connection will
          be waiting when you reconnect.
        </p>
      </hgroup>
    </main>
  );
}
