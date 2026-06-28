import type { Metadata } from "next";
import Link from "next/link";

import { getArticles, getDraftArticles } from "@/app/writing/articles";
import { getDueStats } from "@/lib/lib-db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Tool = {
  href: string;
  name: string;
  tagline: string;
  dotClass: string;
};

export default async function AdminPage() {
  const [published, drafts, libStats] = await Promise.all([
    getArticles(),
    getDraftArticles(),
    Promise.resolve(getDueStats()),
  ]);

  const tools: Tool[] = [
    {
      href: "/admin/writing",
      name: "Writing",
      tagline: "Drafts, publishing, snapshots to git.",
      dotClass: "bg-[#F25022]",
    },
    {
      href: "/admin/lib",
      name: "Lib",
      tagline: "German, learned with a quiet AI.",
      dotClass: "bg-[#7FBA00]",
    },
    {
      href: "/admin/log",
      name: "Log",
      tagline: "Ops dashboard for the personal stack.",
      dotClass: "bg-[#00A4EF]",
    },
    {
      href: "/admin/links",
      name: "Links",
      tagline: "Saved reading and references.",
      dotClass: "bg-[#FFB900]",
    },
  ];

  const stats: Record<string, string> = {
    "/admin/writing": `${published.length} published · ${drafts.length} draft${drafts.length === 1 ? "" : "s"}`,
    "/admin/lib": `${libStats.total} cards · ${libStats.due} due`,
    "/admin/log": "Live",
    "/admin/links": "Coming soon",
  };

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date())
    .replace(",", " ·");

  return (
    <main className="flex flex-1 flex-col items-start gap-14 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] tabular-nums text-zinc-500 dark:text-zinc-500">
          {dateLabel}
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Behind the scenes.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          A small workshop, kept close.
        </p>
      </hgroup>

      <ul className="flex w-full flex-col">
        {tools.map((tool) => (
          <ToolRow key={tool.href} tool={tool} stat={stats[tool.href]} />
        ))}
      </ul>
    </main>
  );
}

function ToolRow({ tool, stat }: { tool: Tool; stat?: string }) {
  return (
    <li className="py-3 first:pt-0 last:pb-0 sm:py-6">
      <Link href={tool.href} className="group flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            "mt-2 size-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125",
            tool.dotClass,
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-sans text-xl font-semibold leading-tight tracking-tight text-foreground transition-opacity group-hover:opacity-70">
              {tool.name}
            </p>
            {stat && (
              <p className="shrink-0 font-sans text-[10px] font-medium uppercase tracking-[0.2em] tabular-nums text-zinc-500 dark:text-zinc-500">
                {stat}
              </p>
            )}
          </div>
          <p className="mt-1 font-serif text-sm leading-snug text-pretty text-zinc-600 dark:text-zinc-400">
            {tool.tagline}
          </p>
        </div>
      </Link>
    </li>
  );
}
