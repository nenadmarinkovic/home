import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEntryBySlug, listCardsForEntry } from "@/lib/lib-db";
import { EntryDetailClient } from "./entry-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) return { title: "Lib · Admin", robots: { index: false, follow: false } };
  return {
    title: `${entry.term} · Lib · Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const cards = listCardsForEntry(entry.id);
  return <EntryDetailClient entry={entry} cards={cards} />;
}
