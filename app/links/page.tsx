import type { Metadata } from "next";

import { ACCESS_TAG_SLUGS, listLinks } from "@/lib/links-db";
import { hostnameOf } from "@/lib/url-utils";

import { LinksList, type ClientLink, type ClientTag } from "./links-list";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Pages I’ve come across the web and want to keep around — technology, AI, design, web development, culture, and anything else worth a look.",
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

  const tagCounts = new Map<string, ClientTag>();
  for (const link of links) {
    for (const tag of link.tags) {
      const entry = tagCounts.get(tag.slug);
      if (entry) entry.count += 1;
      else tagCounts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
    }
  }
  const tags: ClientTag[] = Array.from(tagCounts.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/70">
          Links
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Pages worth sharing
        </h1>
        <p className="mt-4 text-base italic leading-normal text-balance text-foreground/70">
          Pages I&rsquo;ve come across and want to keep around — technology, AI,
          design, web, culture, and anything else worth a look.
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
