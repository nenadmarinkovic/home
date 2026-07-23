"use client";

import { useEffect, useMemo, useState } from "react";
import { XIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type ClientTag = { slug: string; name: string; count: number };
export type ClientLink = {
  id: number;
  url: string;
  title: string;
  note: string;
  hostname: string;
  dateLabel: string;
  tags: { slug: string; name: string }[];
};

type Props = {
  tags: ClientTag[];
  links: ClientLink[];
  initialActiveTags: string[];
};

export function LinksList({ tags, links, initialActiveTags }: Props) {
  const [activeTags, setActiveTags] = useState<string[]>(initialActiveTags);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTags.length === 0) {
      url.searchParams.delete("tags");
    } else {
      url.searchParams.set("tags", activeTags.join(","));
    }
    window.history.replaceState(null, "", url.toString());
  }, [activeTags]);

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return links;
    return links.filter((link) => {
      const slugs = new Set(link.tags.map((t) => t.slug));
      for (const s of activeTags) if (!slugs.has(s)) return false;
      return true;
    });
  }, [links, activeTags]);

  function toggle(slug: string) {
    setActiveTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="flex w-full flex-wrap gap-2">
          {tags.map((tag) => {
            const active = activeTags.includes(tag.slug);
            return (
              <button
                key={tag.slug}
                type="button"
                onClick={() => toggle(tag.slug)}
                aria-pressed={active}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  active
                    ? "border-[#0040ff] bg-[#0040ff] text-white dark:border-[#ffff01] dark:bg-[#ffff01] dark:text-black"
                    : "border-foreground/15 text-zinc-600 hover:border-foreground/30 hover:text-foreground dark:text-zinc-400",
                )}
              >
                <span>{tag.name}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    active
                      ? "text-white/70 dark:text-black/60"
                      : "text-foreground/40",
                  )}
                >
                  {tag.count}
                </span>
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-foreground/15 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:border-foreground/30 hover:text-foreground dark:text-zinc-400"
            >
              <XIcon weight="bold" className="size-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="self-center text-base text-zinc-500 dark:text-zinc-500">
          {activeTags.length > 0
            ? "Nothing here for that combination yet."
            : "No links saved yet."}
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-12">
          {filtered.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-foreground/50">
                  {link.dateLabel}
                </p>
                <h2 className="text-xl font-medium text-balance text-foreground transition-opacity group-hover:opacity-70 sm:text-2xl">
                  {link.title || link.url}
                </h2>
                <p className="text-base leading-[1.55] text-pretty text-foreground/70">
                  {link.hostname}
                </p>
                {link.note && (
                  <p className="text-base leading-[1.55] text-pretty text-foreground/70">
                    {link.note}
                  </p>
                )}
                {link.tags.length > 0 && (
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {link.tags.map((t) => (
                      <span
                        key={t.slug}
                        className="font-sans text-xs text-foreground/50"
                      >
                        #{t.slug}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
