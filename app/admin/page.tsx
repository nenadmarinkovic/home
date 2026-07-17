import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Paperclip,
  PencilSimpleLine,
  Pulse,
} from "@phosphor-icons/react/dist/ssr";

import { getArticles, getDraftArticles } from "@/app/writing/articles";
import { getDueStats } from "@/lib/lib-db";
import { LiveClock } from "./live-clock";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Tool = {
  href: string;
  name: string;
  tagline: string;
  Icon: typeof BookOpen;
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
      Icon: PencilSimpleLine,
    },
    {
      href: "/admin/lib",
      name: "Lib",
      tagline: "German, learned with a quiet AI.",
      Icon: BookOpen,
    },
    {
      href: "/admin/log",
      name: "Log",
      tagline: "Ops dashboard for the personal stack.",
      Icon: Pulse,
    },
    {
      href: "/admin/links",
      name: "Links",
      tagline: "Saved reading and references.",
      Icon: Paperclip,
    },
  ];

  const stats: Record<string, string> = {
    "/admin/writing": `${published.length} published · ${drafts.length} draft${drafts.length === 1 ? "" : "s"}`,
    "/admin/lib": `${libStats.total} cards · ${libStats.due} due`,
    "/admin/log": "Live",
  };

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date())
    .replace(",", " ·");

  return (
    <main className="flex flex-1 flex-col items-start gap-14 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <LiveClock fallback={dateLabel} />
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Welcome back
        </h1>
        <p className="text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Your admin tools, all in one place.
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
        <div className="mt-0.5 shrink-0 rounded-xl border border-foreground/10 bg-white p-2 transition-transform duration-200 group-hover:scale-110">
          <tool.Icon weight="regular" className="size-6 text-black" />
        </div>
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
          <p className="mt-1 text-sm leading-snug text-pretty text-zinc-600 dark:text-zinc-400">
            {tool.tagline}
          </p>
        </div>
      </Link>
    </li>
  );
}
