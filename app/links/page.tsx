import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description:
    "A handful of sites — friends, tools, and quiet corners of the web.",
};

export default function LinksPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Links
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Pages I keep coming back to.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          A handful of sites — friends, tools, and quiet corners of the web.
        </p>
      </hgroup>
    </main>
  );
}
