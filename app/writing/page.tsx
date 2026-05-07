import type { Metadata } from "next";
import Link from "next/link";

import { AdminActions } from "@/components/admin-actions";

import { getArticles } from "./articles";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays on tools, process, and making things that last.",
};

export default async function WritingIndexPage() {
  const list = await getArticles();
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <h1 className="sr-only">Writing</h1>
      <ul className="w-full divide-y divide-foreground/10">
        {list.map((a) => (
          <li
            key={a.slug}
            className="flex items-start justify-between gap-3 py-8 first:pt-0 last:pb-0"
          >
            <Link
              href={`/writing/${a.slug}`}
              className="group flex flex-1 flex-col gap-2"
            >
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
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
