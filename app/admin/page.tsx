import type { Metadata } from "next";
import type { ReactElement } from "react";
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
  colorClass: string;
  Icon: (props: { className?: string }) => ReactElement;
};

// Loose, hand-drawn single-stroke doodles. Slightly wobbly paths on purpose —
// the imperfection is the point. They inherit `currentColor` so each tool can
// tint its own.
const sketch = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

// Writing — a nib scribbling a loose squiggle.
function WritingDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...sketch}>
      <path d="M4 17.5c2-.4 3.2-2.6 4.4-4.6 1.1-1.9.4-3-.8-2.5-1.3.5-1.6 3.1-.4 4.6 1 1.3 3.2 1.1 5-.4" />
      <path d="M14.6 14.2l4.3-5.1c.6-.7.5-1.6-.2-2.2-.7-.6-1.6-.5-2.2.2l-4.3 5.1-.6 2.6z" />
    </svg>
  );
}

// Lib — an open book, pages a touch uneven.
function LibDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...sketch}>
      <path d="M12 6.4C10.3 5.4 8 5 5.5 5.4c-.6.1-1 .5-1 1.1v9.2c0 .5.5.9 1.1.8C8 16.1 10.2 16.6 12 17.7" />
      <path d="M12 6.4c1.7-1 4-1.4 6.5-1 .6.1 1 .5 1 1.1v9.2c0 .5-.5.9-1.1.8-2.4-.4-4.6.1-6.4 1.2" />
      <path d="M12 6.6v11" />
    </svg>
  );
}

// Log — a heartbeat / pulse line with a hand-drawn wobble.
function LogDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...sketch}>
      <path d="M3.5 12.4c1.6.2 2.8.1 3.6-.4.8-.5 1.3-2.3 1.9-4.2.5-1.7 1.2-1.8 1.7 0 .6 2.1 1.2 5.6 2 5.6.7 0 1.1-1.6 1.7-2.6.5-.9 1-1.2 1.8-1.1 1 .1 2.3.3 4.1.2" />
    </svg>
  );
}

// Links — two interlocking chain links, loosely drawn.
function LinksDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...sketch}>
      <path d="M10.2 13.7c-.9.9-2.3 1-3.2.1l-1.6-1.6c-.9-.9-.9-2.4.1-3.4l1.7-1.7c1-1 2.5-1 3.4-.1l.8.8" />
      <path d="M13.8 10.3c.9-.9 2.3-1 3.2-.1l1.6 1.6c.9.9.9 2.4-.1 3.4l-1.7 1.7c-1 1-2.5 1-3.4.1l-.8-.8" />
    </svg>
  );
}

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
      colorClass: "text-[#F25022]",
      Icon: WritingDoodle,
    },
    {
      href: "/admin/lib",
      name: "Lib",
      tagline: "German, learned with a quiet AI.",
      colorClass: "text-[#7FBA00]",
      Icon: LibDoodle,
    },
    {
      href: "/admin/log",
      name: "Log",
      tagline: "Ops dashboard for the personal stack.",
      colorClass: "text-[#00A4EF]",
      Icon: LogDoodle,
    },
    {
      href: "/admin/links",
      name: "Links",
      tagline: "Saved reading and references.",
      colorClass: "text-[#FFB900]",
      Icon: LinksDoodle,
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
          Welcome back.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
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
        <tool.Icon
          className={cn(
            "mt-1 size-6 shrink-0 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110",
            tool.colorClass,
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
