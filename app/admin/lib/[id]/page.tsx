import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEntryById, listCardsForEntry } from "@/lib/lib-db";
import { EntryDetailClient } from "./entry-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntryById(Number(id));
  if (!entry) return { title: "Lib · Admin", robots: { index: false, follow: false } };
  return {
    title: `${entry.term} · Lib · Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entryId = Number(id);
  if (!Number.isFinite(entryId)) notFound();

  const entry = getEntryById(entryId);
  if (!entry) notFound();

  const cards = listCardsForEntry(entryId);
  return <EntryDetailClient entry={entry} cards={cards} />;
}
