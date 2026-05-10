import type { Metadata } from "next";
import Link from "next/link";
import {
  ChartLineUp,
  LinkSimple,
  PencilSimple,
  Translate,
} from "@phosphor-icons/react/dist/ssr";

import { getArticles, getDraftArticles } from "@/app/writing/articles";
import { getDueStats } from "@/lib/lib-db";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Tool = {
  href: string;
  name: string;
  tagline: string;
  Icon: typeof PencilSimple;
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
      Icon: PencilSimple,
    },
    {
      href: "/admin/lib",
      name: "Lib",
      tagline: "German, learned with a quiet AI.",
      Icon: Translate,
    },
    {
      href: "/admin/log",
      name: "Log",
      tagline: "Ops dashboard for the personal stack.",
      Icon: ChartLineUp,
    },
    {
      href: "/admin/links",
      name: "Links",
      tagline: "Saved reading and references.",
      Icon: LinkSimple,
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

      <ul className="grid w-full grid-cols-2 gap-3">
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.href}
            tool={tool}
            index={index}
            stat={stats[tool.href]}
          />
        ))}
      </ul>

      <p className="self-center font-serif text-base italic text-zinc-500 dark:text-zinc-500">
        Quiet hours, slow work.
      </p>
    </main>
  );
}

function ToolCard({
  tool,
  index,
  stat,
}: {
  tool: Tool;
  index: number;
  stat?: string;
}) {
  const { Icon } = tool;
  return (
    <li>
      <Link
        href={tool.href}
        className="group relative flex min-h-48 flex-col justify-between gap-8 border border-foreground/10 bg-card p-6 transition-colors duration-200 hover:border-foreground/30"
      >
        <div className="flex items-start justify-between">
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] tabular-nums text-zinc-500 dark:text-zinc-500">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Icon
            weight="light"
            className="size-8 text-foreground/85 transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </div>
        <div className="space-y-3">
          <div>
            <p className="font-serif text-xl font-semibold leading-tight tracking-tight text-foreground">
              {tool.name}
            </p>
            <p className="mt-1 font-serif text-sm italic leading-snug text-zinc-600 text-pretty dark:text-zinc-400">
              {tool.tagline}
            </p>
          </div>
          {stat && (
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] tabular-nums text-zinc-500 dark:text-zinc-500">
              {stat}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
