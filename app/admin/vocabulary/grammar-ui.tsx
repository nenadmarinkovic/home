"use client";

import * as React from "react";
import {
  ArrowsLeftRightIcon,
  FlowArrowIcon,
  InfoIcon,
  LightbulbIcon,
  MapPinIcon,
  ProhibitIcon,
  ScalesIcon,
  WarningIcon,
} from "@phosphor-icons/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Cells and prose are authored as plain strings; text wrapped in asterisks is
 * rendered in the accent colour, which is how endings and key words are
 * highlighted throughout the reference.
 */
export function rich(node: React.ReactNode): React.ReactNode {
  if (typeof node !== "string" || !node.includes("*")) return node;
  return node.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="font-semibold text-[#0040ff] dark:text-[#ffff01]"
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

export function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-9">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-normal tracking-tight text-balance text-foreground">
          {title}
        </h2>
        {lead && (
          <p className="max-w-prose text-sm leading-relaxed text-zinc-600 text-pretty dark:text-zinc-400">
            {rich(lead)}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

export function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 scroll-mt-4 flex-col gap-3.5">
      <h3 className="flex items-center gap-2.5 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        {title}
        <span aria-hidden className="h-px flex-1 bg-foreground/8" />
      </h3>
      {children}
    </div>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-prose text-sm leading-relaxed text-foreground/90 text-pretty">
      {rich(children)}
    </p>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex max-w-prose list-none flex-col gap-1.5 pl-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-4 text-sm leading-relaxed text-foreground/90 text-pretty before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-full before:bg-foreground/20"
        >
          {rich(item)}
        </li>
      ))}
    </ul>
  );
}

/**
 * A German line paired with its Serbian reading, plus an optional label for
 * the role the line plays (Aktiv, Dativ, ...). The pair sits side by side once
 * the content column is wide enough, and stacks below that.
 */
export type Example = [de: string, sr: string, label?: string];

export function Examples({ items }: { items: Example[] }) {
  return (
    <ul className="list-none divide-y divide-foreground/8 overflow-hidden rounded-xl border border-foreground/10 pl-0">
      {items.map(([de, sr, label], i) => (
        <li key={i} className="grid pl-0 @2xl:grid-cols-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3.5 pt-2.5 @2xl:px-4 @2xl:py-3">
            {label && (
              <span className="shrink-0 rounded-full bg-foreground/6 px-1.5 py-px font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {label}
              </span>
            )}
            <span className="text-sm font-medium leading-snug text-foreground">
              {rich(de)}
            </span>
          </div>
          <div className="px-3.5 pb-2.5 pt-0.5 text-sm leading-snug text-zinc-500 @2xl:border-l @2xl:border-foreground/8 @2xl:px-4 @2xl:py-3 dark:text-zinc-500">
            {sr}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A pattern or formula, set apart from the prose. */
export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-foreground/10 bg-foreground/3 px-3.5 py-3">
      <FlowArrowIcon
        weight="bold"
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-zinc-500"
      />
      <p className="font-sans text-sm font-medium leading-relaxed text-foreground">
        {rich(children)}
      </p>
    </div>
  );
}

const NOTE_ICONS = {
  info: InfoIcon,
  warn: WarningIcon,
  /** Worth memorising as-is: same mark as a warning, without the alarm colour. */
  remember: WarningIcon,
  /** A shortcut or mnemonic. */
  tip: LightbulbIcon,
  /** Two forms that are easy to mix up. */
  compare: ArrowsLeftRightIcon,
  /** A hard rule with no exceptions. */
  rule: ScalesIcon,
  /** Something that looks right and is not. */
  trap: ProhibitIcon,
  /** Differs in Austria from the standard taught in most textbooks. */
  austria: MapPinIcon,
} as const;

export function Note({
  title,
  children,
  tone = "info",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: keyof typeof NOTE_ICONS;
}) {
  const Icon = NOTE_ICONS[tone];
  // Zapamti, Pazi and Zamka all carry the same warning ground.
  const loud = tone === "warn" || tone === "trap" || tone === "remember";

  return (
    <aside
      className={cn(
        "flex max-w-prose items-start gap-2.5 rounded-xl border px-3.5 py-3",
        loud
          ? "border-warning/25 bg-warning/8"
          : "border-foreground/10 bg-foreground/2",
      )}
    >
      <Icon
        weight="bold"
        aria-hidden
        className={cn(
          "mt-0.5 size-4 shrink-0",
          loud ? "text-warning" : "text-zinc-500",
        )}
      />
      <div className="flex min-w-0 flex-col gap-1">
        {title && (
          <p
            className={cn(
              "font-sans text-[11px] font-semibold uppercase tracking-wider",
              loud ? "text-warning" : "text-zinc-600 dark:text-zinc-400",
            )}
          >
            {title}
          </p>
        )}
        <div className="text-sm leading-relaxed text-foreground/90 text-pretty">
          {rich(children)}
        </div>
      </div>
    </aside>
  );
}

export function GTable({
  head,
  rows,
  wrap = false,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  /** Let long cells break across lines instead of scrolling sideways. */
  wrap?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="border-foreground/10 bg-foreground/3 hover:bg-transparent">
            {head.map((h, i) => (
              <TableHead
                key={i}
                className="h-9 px-3 font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={i}
              className="border-foreground/6 last:border-0 hover:bg-foreground/2"
            >
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  className={cn(
                    "px-3 py-2 align-top",
                    wrap && "whitespace-normal",
                    j === 0
                      ? "font-medium text-zinc-600 dark:text-zinc-400"
                      : "text-foreground",
                  )}
                >
                  {rich(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Two columns of blocks on wide screens, stacked on narrow ones. */
export function Cols({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 @4xl:grid-cols-2 @4xl:gap-8">
      {children}
    </div>
  );
}
