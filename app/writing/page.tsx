import type { Metadata } from "next";
import Link from "next/link";

import { AdminActions } from "@/components/admin-actions";

import { getArticles } from "./articles";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on software, design, the web, and whatever else I keep coming back to.",
};

export default async function WritingIndexPage() {
  const list = await getArticles();
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
          Writing
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Notes and essays
        </h1>
        <p className="mt-4 mx-auto max-w-sm text-base italic leading-normal text-balance text-foreground/70">
          I sometimes write about topics I find interesting or about projects
          I&rsquo;m working on.
        </p>
      </hgroup>
      {list.length === 0 ? (
        <p className="self-center text-base text-zinc-500 dark:text-zinc-500">
          Nothing published yet.
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-12">
          {list.map((a) => (
            <li key={a.slug} className="flex items-start justify-between gap-3">
              <Link
                href={`/writing/${a.slug}`}
                className="group flex flex-1 flex-col gap-2"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-foreground/50">
                  {a.dateLabel}
                </p>
                <h2 className="text-xl font-medium text-foreground transition-opacity group-hover:opacity-70 sm:text-2xl">
                  {a.title}
                </h2>
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
      )}
    </main>
  );
}
