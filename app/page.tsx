import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { AdminActions } from "@/components/admin-actions";

import { getArticles } from "./writing/articles";

export default async function Home() {
  const latest = (await getArticles()).slice(0, 3);

  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <section className="w-full space-y-5">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Notes from the workshop
        </p>
        <p className="font-serif text-2xl italic leading-snug text-pretty text-foreground">
          I’m Nenad — a software developer in Vienna making thoughtful tools and
          writing about the craft of doing good work on the web.
        </p>
        <p className="font-serif text-(length:--unit-lg) leading-[1.5] text-pretty text-zinc-700 dark:text-zinc-300">
          This is the writing half of my workshop. I publish essays here on
          software, design, and the long arc of making things that last. No
          schedule, no theme — just notes I need to think through.
        </p>
        <p className="font-serif text-(length:--unit-lg) leading-[1.5] text-pretty text-zinc-700 dark:text-zinc-300">
          This is the writing half of my workshop. I publish essays here on
          software, design, and the long arc of making things that last. No
          schedule, no theme — just notes I need to think through.
        </p>
        <p className="font-serif text-(length:--unit-lg) leading-[1.5] text-pretty text-zinc-700 dark:text-zinc-300">
          This is the writing half of my workshop. I publish essays here on
          software, design, and the long arc of making things that last. No
          schedule, no theme — just notes I need to think through.
        </p>
        <p className="font-serif text-(length:--unit-lg) leading-[1.5] text-pretty text-zinc-700 dark:text-zinc-300">
          This is the writing half of my workshop. I publish essays here on
          software, design, and the long arc of making things that last. No
          schedule, no theme — just notes I need to think through.
        </p>
      </section>
      <section className="w-full space-y-6">
        <div className="flex items-baseline justify-between">
          <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Recent
          </p>
          <Link
            href="/writing"
            className="group inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 transition-opacity hover:opacity-70 dark:text-zinc-400"
          >
            All writing
            <ArrowRight
              weight="bold"
              className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <ul className="divide-y divide-foreground/10">
          {latest.map((a) => (
            <li
              key={a.slug}
              className="flex items-start justify-between gap-3 py-8 first:pt-0 last:pb-0"
            >
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
      </section>
    </main>
  );
}
