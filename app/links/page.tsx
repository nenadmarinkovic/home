import type { Metadata } from "next";

import {
  ACCESS_TAG_SLUGS,
  listLinks,
  listTagsWithCounts,
} from "@/lib/links-db";
import { hostnameOf } from "@/lib/url-utils";

import { LinksList, type ClientLink, type ClientTag } from "./links-list";

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

function dateLabelFor(value: Date | string): string {
  const iso = value instanceof Date ? value.toISOString() : value;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialActiveTags = parseActiveTags(params.tags);

  const tags: ClientTag[] = listTagsWithCounts()
    .filter((t) => !ACCESS_TAG_SLUGS.has(t.slug))
    .map((t) => ({ slug: t.slug, name: t.name, count: t.count }));

  const links: ClientLink[] = listLinks({ publicOnly: true, limit: 500 }).map(
    (l) => ({
      id: l.id,
      url: l.url,
      title: l.title,
      note: l.note,
      hostname: hostnameOf(l.url),
      dateLabel: dateLabelFor(l.createdAt as Date | string),
      tags: l.tags
        .filter((t) => !ACCESS_TAG_SLUGS.has(t.slug))
        .map((t) => ({ slug: t.slug, name: t.name })),
    }),
  );

  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
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

      <LinksList
        tags={tags}
        links={links}
        initialActiveTags={initialActiveTags}
      />
    </main>
  );
}
