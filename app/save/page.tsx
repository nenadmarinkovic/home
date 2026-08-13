import type { Metadata } from "next";

import { ACCESS_TAG_SLUGS, listTags } from "@/lib/links-db";

import { SaveForm, type SaveFormTag } from "./save-form";

export const metadata: Metadata = {
  title: "Save a link",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/;

function pickUrl(explicit: string, text: string): string {
  const trimmed = explicit.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const found = text.match(URL_IN_TEXT);
  return found ? found[0] : "";
}

export default async function SavePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const text = first(params.text);
  const url = pickUrl(first(params.url) || first(params.u), text);
  const title = (first(params.title) || first(params.name)).trim();
  const note =
    first(params.note).trim() || (text.trim() === url ? "" : text.trim());

  const tags: SaveFormTag[] = listTags()
    .filter((t) => !ACCESS_TAG_SLUGS.has(t.slug))
    .map((t) => ({ slug: t.slug, name: t.name }));

  return (
    <main className="flex flex-1 flex-col items-start gap-10 pb-20 pt-12 md:pt-16">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
          Save
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Save a link
        </h1>
      </hgroup>
      <SaveForm
        initialUrl={url}
        initialTitle={title}
        initialNote={note}
        tags={tags}
      />
    </main>
  );
}
