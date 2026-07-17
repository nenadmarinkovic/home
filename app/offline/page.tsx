import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You appear to be offline.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-6 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-400">
          Offline
        </p>
        <h1 className="text-4xl font-light text-balance text-foreground">
          You&apos;re offline
        </h1>
        <p className="text-base font-light italic leading-[1.5] text-balance text-zinc-600 dark:text-zinc-400">
          Some things work, like your vocabulary review. Some need a connection,
          and they&apos;ll be here when you reconnect.
        </p>
      </hgroup>
    </main>
  );
}
