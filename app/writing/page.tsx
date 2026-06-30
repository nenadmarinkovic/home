import type { Metadata } from "next";
import Link from "next/link";

import { AdminActions } from "@/components/admin-actions";

import { getArticles } from "./articles";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes I’ve put down along the way — software, design, the web, and anything else worth thinking about.",
};

export default async function WritingIndexPage() {
  const list = await getArticles();
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Writing
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Notes worth keeping
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Notes I&rsquo;ve put down along the way — software, design, the web,
          and anything else worth thinking about.
        </p>
      </hgroup>
      <ul className="flex w-full flex-col gap-12">
        {list.map((a) => (
          <li key={a.slug} className="flex items-start justify-between gap-3">
            <Link
              href={`/writing/${a.slug}`}
              className="group flex flex-1 flex-col gap-2"
            >
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-[#F25022]">
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
            <AdminActions article={a} className="-mt-1" />
          </li>
        ))}
      </ul>
    </main>
  );
}
