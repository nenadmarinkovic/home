import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infrastructure",
  description: "How this site is hosted, built, and put together.",
};

export default function InfrastructurePage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Infrastructure
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          How it’s built.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          How this site is hosted, built, and put together.
        </p>
      </hgroup>
    </main>
  );
}
