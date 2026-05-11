import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOutIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

import {
  ACCESS_TAG_SLUGS,
  listLinks,
  listTagsWithCounts,
} from "@/lib/links-db";
import { hostnameOf } from "@/lib/url-utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Links",
  description:
    "A handful of sites — friends, tools, and quiet corners of the web.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseActiveTags(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && !ACCESS_TAG_SLUGS.has(s));
}

function buildHref(active: string[], toggleSlug: string): string {
  const set = new Set(active);
  if (set.has(toggleSlug)) set.delete(toggleSlug);
  else set.add(toggleSlug);
  const next = Array.from(set);
  if (next.length === 0) return "/links";
  return `/links?tags=${next.join(",")}`;
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeTags = parseActiveTags(params.tags);

  const allTags = listTagsWithCounts().filter(
    (t) => !ACCESS_TAG_SLUGS.has(t.slug),
  );
  const links = listLinks({
    publicOnly: true,
    tagSlugs: activeTags,
    limit: 200,
  });

  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Links
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Pages I keep coming back to.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          A handful of sites — friends, tools, and quiet corners of the web.
        </p>
      </hgroup>

      {allTags.length > 0 && (
        <div className="flex w-full flex-wrap gap-2">
          {activeTags.length > 0 && (
            <Link
              href="/links"
              className="inline-flex items-center gap-1 rounded-full border border-foreground/15 px-3 py-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 transition-colors hover:border-foreground/30 hover:text-foreground dark:text-zinc-400"
            >
              <XIcon weight="bold" className="size-3" />
              Clear
            </Link>
          )}
          {allTags.map((tag) => {
            const active = activeTags.includes(tag.slug);
            return (
              <Link
                key={tag.slug}
                href={buildHref(activeTags, tag.slug)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 text-zinc-600 hover:border-foreground/30 hover:text-foreground dark:text-zinc-400",
                )}
              >
                {tag.name}
              </Link>
            );
          })}
        </div>
      )}

      {links.length === 0 ? (
        <p className="self-center font-serif text-base italic text-zinc-500 dark:text-zinc-500">
          {activeTags.length > 0
            ? "Nothing here for that combination yet."
            : "No links saved yet."}
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-6">
          {links.map((link) => {
            const host = hostnameOf(link.url);
            const visibleTags = link.tags.filter(
              (t) => !ACCESS_TAG_SLUGS.has(t.slug),
            );
            return (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1"
                >
                  <div className="flex items-baseline gap-2">
                    <p className="truncate font-serif text-lg font-semibold leading-tight text-foreground transition-opacity group-hover:opacity-70">
                      {link.title || link.url}
                    </p>
                    <ArrowSquareOutIcon
                      weight="bold"
                      className="size-3 shrink-0 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </div>
                  <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                    {host}
                  </p>
                  {link.note && (
                    <p className="font-serif text-sm italic leading-snug text-zinc-600 dark:text-zinc-400">
                      {link.note}
                    </p>
                  )}
                  {visibleTags.length > 0 && (
                    <p className="flex flex-wrap gap-1 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                      {visibleTags.map((t, i) => (
                        <span key={t.slug}>
                          {i > 0 && "· "}
                          {t.name}
                        </span>
                      ))}
                    </p>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
