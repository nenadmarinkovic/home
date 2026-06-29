import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description: "Software I use every day, and a few I built myself.",
};

export default function ToolsPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Tools
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Tools of the trade.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Software I use every day, and a few I built myself.
        </p>
      </hgroup>
    </main>
  );
}
