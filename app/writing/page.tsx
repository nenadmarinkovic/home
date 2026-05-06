import type { Metadata } from "next";
import Link from "next/link";

import { articles } from "./articles";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays on tools, process, and making things that last.",
};

export default function WritingIndexPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          Writing
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          The full archive.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Every essay I’ve published, in reverse chronological order.
        </p>
      </hgroup>
      <ul className="w-full divide-y divide-foreground/10">
        {articles.map((a) => (
          <li key={a.slug} className="py-8 first:pt-0 last:pb-0">
            <Link
              href={`/writing/${a.slug}`}
              className="group flex flex-col gap-2"
            >
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                {a.dateLabel}
              </p>
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-pretty text-foreground transition-opacity group-hover:opacity-70">
                {a.title}
              </h2>
              <p className="font-serif text-(length:--unit-lg) italic leading-snug text-pretty text-zinc-600 dark:text-zinc-400">
                {a.subtitle}
              </p>
              <p className="font-serif text-base leading-[1.5] text-pretty text-zinc-700 dark:text-zinc-300">
                {a.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
