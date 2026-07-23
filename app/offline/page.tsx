import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You appear to be offline.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-6 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
          Offline
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          You&apos;re offline
        </h1>
        <p className="mt-4 text-base italic leading-[1.5] text-balance text-foreground/70">
          Some things work, like your vocabulary review. Some need a connection,
          and they&apos;ll be here when you reconnect.
        </p>
      </hgroup>
    </main>
  );
}
