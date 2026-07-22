import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { AdminActions } from "@/components/admin-actions";
import { AnimatedGreeting } from "@/components/animated-greeting";

import { getArticles } from "./writing/articles";

export default async function Home() {
  const latest = (await getArticles()).slice(0, 3);

  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <section className="w-full space-y-4">
        <div className="space-y-2">
          <p className="text-2xl font-normal text-foreground sm:text-3xl">
            <AnimatedGreeting />
          </p>
          <h1 className="text-2xl font-normal text-balance text-foreground sm:text-3xl">
            I&rsquo;m Nenad, a Vienna-based software developer.
          </h1>
        </div>
        <p className="text-base leading-[1.55] text-pretty text-foreground/80">
          Next year marks ten years since I started working on the web. I still
          think it&rsquo;s the best platform we have for making things, and I
          want to push it a little further.
        </p>
        <p className="text-base leading-[1.55] text-pretty text-foreground/80">
          Right now, that means building a German-learning platform and laying
          the groundwork for my first studio — for educators and online creators
          who need more than a template.
        </p>
        <p className="text-base leading-[1.55] text-pretty text-foreground/80">
          This site is the hub for it all. I share my work, thoughts, and the
          links I find interesting.
        </p>
        <p className="text-base leading-[1.55] text-pretty text-foreground/80">
          Have a look around, and if you&rsquo;d like to say hi, there&rsquo;s a{" "}
          <Link
            href="/contact"
            className="font-semibold text-[#cd2d00] transition-opacity hover:opacity-70 dark:text-[#F25022]"
          >
            contact
          </Link>{" "}
          page.
        </p>
      </section>
      <section className="w-full space-y-8">
        <div className="flex items-baseline justify-between">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400">
            Recent
          </p>
          <Link
            href="/writing"
            className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
          >
            All writing
            <ArrowRight
              weight="bold"
              className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <ul>
          {latest.map((a) => (
            <li
              key={a.slug}
              className="flex items-start justify-between gap-3 py-8 first:pt-0 last:pb-0"
            >
              <Link
                href={`/writing/${a.slug}`}
                className="group flex flex-1 flex-col gap-3"
              >
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.06em] text-[#cd2d00] dark:text-[#F25022]">
                  {a.dateLabel}
                </p>
                <h2 className="text-xl font-medium text-balance text-foreground transition-opacity group-hover:opacity-70 sm:text-2xl">
                  {a.title}
                </h2>
                {a.subtitle && (
                  <p className="text-base leading-[1.55] text-pretty text-foreground/80">
                    {a.subtitle}
                  </p>
                )}
                {a.description && (
                  <p className="text-base leading-[1.55] text-pretty text-foreground/80">
                    {a.description}
                  </p>
                )}
              </Link>
              <AdminActions article={a} className="-mt-1" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
