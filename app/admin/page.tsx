import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ChartLineUp,
  LinkSimple,
  PencilSimple,
  Translate,
} from "@phosphor-icons/react/dist/ssr";

import { LogoutButton } from "./writing/logout-button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

type Tool = {
  href: string;
  name: string;
  tagline: string;
  Icon: typeof PencilSimple;
};

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

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-14 py-20">
      <div className="flex w-full justify-end">
        <LogoutButton />
      </div>

      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
          Admin
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Behind the scenes.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Personal tools I keep close to hand.
        </p>
      </hgroup>

      <ul className="grid w-full grid-cols-2 gap-3">
        {tools.map((tool, index) => (
          <ToolCard key={tool.href} tool={tool} index={index} />
        ))}
      </ul>
    </main>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { Icon } = tool;
  return (
    <li>
      <Link
        href={tool.href}
        className="group relative flex min-h-44 flex-col justify-between gap-10 border border-foreground/10 bg-card p-6 transition-colors duration-200 hover:border-foreground/30"
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
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-xl font-semibold leading-tight tracking-tight text-foreground">
              {tool.name}
            </p>
            <p className="mt-1 font-serif text-sm italic leading-snug text-zinc-600 text-pretty dark:text-zinc-400">
              {tool.tagline}
            </p>
          </div>
          <ArrowUpRight
            weight="bold"
            className="mb-1 size-4 shrink-0 -translate-x-1 text-zinc-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100"
          />
        </div>
      </Link>
    </li>
  );
}
