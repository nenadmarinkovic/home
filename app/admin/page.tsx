import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";

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
  Icon: (props: { className?: string }) => ReactElement;
};

// Hand-drawn, monochrome icons. The wobble and double-pass strokes are baked
// into the path data — generated once by running clean base shapes (pencil,
// open book, pulse, paperclip) through Rough.js with a fixed seed, so they look
// genuinely sketched rather than like a tidied-up icon set. They inherit
// `currentColor`, so they follow the foreground in light/dark.
const sketch = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function makeDoodle(d: string) {
  return function Doodle({ className }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden {...sketch}>
        <path d={d} />
      </svg>
    );
  };
}

// Writing — a pencil.
const WritingDoodle = makeDoodle(
  "M12.8 19.2 C14.1 20.4, 16.7 20.5, 20.6 20.2 M12.5 20.5 C14.6 20.5, 16.8 20.3, 20.8 20.2 M16.5 3.5 C18.5 3.1, 20.3 2.9, 21.6 6 M17.8 3.2 C16 3.4, 18.5 1.8, 22.1 3.7 M20 4.5 C21.4 6.1, 19.9 6.5, 18.3 5.2 M20.9 4.2 C22.1 4.7, 21.8 5.3, 21 8.3 M19.7 6.1 C15.2 10.4, 8.5 15.7, 7.7 17.4 M19.8 6.9 C15.2 11.4, 9.2 16.3, 7.4 19.8 M6.6 18.7 C5.4 19.7, 5.2 19.8, 3.5 19.7 M7.2 19.2 C5.3 19.6, 3.9 19.8, 2.8 20.1 M2.6 20.5 C3.6 19.6, 3.1 17.9, 4.4 16.5 M3.2 19.9 C3.3 19, 3.8 17.8, 4 15.9 M2.5 14.8 C7.5 12.2, 10.8 6.6, 17.6 2.4 M3.8 16.5 C6.7 12.3, 11 9.5, 15.8 3",
);

// Lib — an open book.
const LibDoodle = makeDoodle(
  "M1.2 3.1 C3.7 3.2, 4.5 2.9, 7.7 3.1 M2.1 2.8 C3.2 2.7, 4.9 2.7, 7.9 2.9 M8 3 C11.5 3.2, 11.4 4, 13.1 7.5 M9.6 4.4 C12 1.7, 13.3 3.9, 13.6 8.2 M11.9 8 C12.9 12.5, 10.9 16.6, 11.1 22.3 M12 7.3 C12.2 9.3, 11.8 12.7, 11.2 21.3 M12 21 C12.3 18.6, 11.9 17.7, 9.3 19.7 M11.5 22.5 C13.4 20.2, 8.7 16.4, 7.4 16.4 M9.2 17.4 C6.4 18.8, 4.8 18.5, 2.9 17.7 M8.7 18.3 C6.3 17.9, 4.9 17.5, 2.3 17.8 M2.8 19.2 C0.8 14, 1.4 11.1, 1 4 M2.8 18.1 C1.4 12.3, 2.2 8.4, 1.7 3.3 M22.1 3 C19.9 3.5, 16.9 2.3, 15.9 3.3 M21.9 2.7 C20.1 3.1, 17.8 2.9, 15.6 3.1 M16 3 C15.7 3.8, 15.8 5.3, 11.7 7.1 M15.3 3 C15.6 3.6, 14.1 5.7, 12.9 6.8 M12.6 7 C12.6 10, 10.6 15.7, 11.2 22.6 M11.8 6.8 C12.1 11.3, 11.8 16.1, 12.4 20.8 M12 21 C10.3 18.7, 14.4 18.6, 15.2 18.1 M12.8 21.4 C11.2 18.9, 15.4 18.9, 15.9 17.9 M15.6 17.4 C16.9 18.8, 19.2 18, 21.3 18.3 M15.4 18 C17.5 17.7, 20 18, 21.6 17.6 M20.6 17.6 C20.7 11.8, 22.2 7.9, 23 2.9 M22.4 17.5 C22 12.5, 21.3 8.1, 21.3 3.1",
);

// Log — a heartbeat / pulse line.
const LogDoodle = makeDoodle(
  "M21.6 12.5 C20.7 12, 20 11.6, 17.8 12 M22 12.1 C20.9 11.8, 20.1 11.9, 18 11.8 M17.8 13.1 C15.8 13.9, 15.6 18.8, 14.4 21.6 M17.5 11.5 C16.7 14.5, 15.6 18.3, 15.4 21.6 M15.5 22.2 C13.2 14.2, 11.4 11.7, 9.8 2.6 M15.6 20.6 C12.8 16.6, 12.4 11.7, 8.2 2.4 M10 2.6 C7.6 6, 8.1 9.2, 5 11.1 M9.5 3.6 C8.1 5.3, 7 8, 5.8 12.4 M6 12 C5.4 12.2, 4.1 12.3, 1.8 12.3 M6.1 12 C4.9 11.8, 3.8 12.1, 1.8 12.1",
);

// Links — a paperclip.
const LinksDoodle = makeDoodle(
  "M20.7 10.6 C18.7 12.7, 18.6 15.7, 11.8 20.3 M20.9 11.8 C19 13, 16 16.1, 12.4 21 M12.3 20.2 C7.9 22.7, 3.6 22.9, 2.5 16 M10.9 21.4 C9.4 21.5, 5.3 21.5, 3 18.6 M2.2 17.5 C1.5 16.7, 2.1 11.8, 4.1 10.4 M3.4 18.3 C2.8 14.6, 1.5 11.4, 2.6 13.2 M3.2 11.3 C5.1 9.4, 10.6 4.9, 13.1 3.2 M4.2 11.5 C7.7 8.1, 10.2 4.1, 13.1 2.4 M13 2.6 C14.6 0.6, 17.6 1.6, 20.8 4.9 M11.6 3.3 C15.5 -1.3, 20.8 -0.5, 21.6 6.3 M19.6 4.4 C18.7 6, 18.7 5.7, 18.7 9.1 M18.3 4 C18.1 7.5, 20.6 8, 20.6 7 M19.8 8.2 C15.8 11.8, 11.6 13.6, 10.9 18.3 M17.9 8.2 C15.1 11.2, 12.8 14.3, 8.7 18 M9.4 17.4 C9.6 19.4, 7.3 19, 5.4 17.3 M7.8 16.4 C9.9 17.2, 6.5 18.5, 5.5 17.7 M6.1 16.5 C4.7 15.9, 7.2 14.8, 8.3 14.1 M5.4 16.4 C5.8 17.4, 5.2 13.8, 4.9 14.9 M5.5 16.1 C10.3 12.7, 10.8 10.7, 15.1 5.4 M5.9 14 C9.1 11.4, 12.5 9.1, 15.2 6.1",
);

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
      Icon: WritingDoodle,
    },
    {
      href: "/admin/lib",
      name: "Lib",
      tagline: "German, learned with a quiet AI.",
      Icon: LibDoodle,
    },
    {
      href: "/admin/log",
      name: "Log",
      tagline: "Ops dashboard for the personal stack.",
      Icon: LogDoodle,
    },
    {
      href: "/admin/links",
      name: "Links",
      tagline: "Saved reading and references.",
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
        <tool.Icon className="mt-1 size-6 shrink-0 text-foreground transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110" />
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
