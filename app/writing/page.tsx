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
        <p className="font-sans text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400">
          Writing
        </p>
        <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
          Notes worth keeping
        </h1>
        <p className="text-base italic leading-[1.55] text-balance text-foreground/70">
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
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#cd2d00] dark:text-[#F25022]">
                {a.dateLabel}
              </p>
              <h2 className="text-xl font-normal text-balance text-foreground transition-opacity group-hover:opacity-70 sm:text-2xl">
                {a.title}
              </h2>
              {a.subtitle && (
                <p className="text-base leading-[1.55] text-pretty text-foreground/70">
                  {a.subtitle}
                </p>
              )}
              {a.description && (
                <p className="text-base leading-[1.55] text-pretty text-foreground/70">
                  {a.description}
                </p>
              )}
            </Link>
            <AdminActions article={a} className="-mt-1" />
          </li>
        ))}
      </ul>
    </main>
  );
}
