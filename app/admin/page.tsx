import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ChartLineUp,
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
];

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Admin
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Behind the scenes.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Personal tools I keep close to hand.
        </p>
      </hgroup>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 self-center font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        <span>
          <span className="tabular-nums">{tools.length}</span> tool
          {tools.length === 1 ? "" : "s"}
        </span>
      </p>

      <ul className="flex w-full flex-col divide-y divide-foreground/10">
        {tools.map((tool) => (
          <ToolRow key={tool.href} tool={tool} />
        ))}
      </ul>

      <div className="self-center">
        <LogoutButton />
      </div>
    </main>
  );
}

function ToolRow({ tool }: { tool: Tool }) {
  const { Icon } = tool;
  return (
    <li className="group/row">
      <Link
        href={tool.href}
        className="flex items-center gap-4 py-5 transition-colors"
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-zinc-700 transition-colors group-hover/row:bg-[#fd6401]/10 group-hover/row:text-[#fd6401] dark:text-zinc-300"
        >
          <Icon weight="regular" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-base font-semibold leading-tight text-foreground transition-opacity group-hover/row:opacity-70">
            {tool.name}
          </p>
          <p className="mt-1 truncate font-serif text-sm italic leading-snug text-zinc-600 dark:text-zinc-400">
            {tool.tagline}
          </p>
        </div>
        <ArrowUpRight
          weight="bold"
          className="size-4 shrink-0 text-zinc-400 transition-all group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:text-foreground"
        />
      </Link>
    </li>
  );
}
