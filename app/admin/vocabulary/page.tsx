import type { Metadata } from "next";

import { getDueStats, listEntries } from "@/lib/vocabulary-db";
import { VocabularyClient } from "./vocabulary-client";

export const metadata: Metadata = {
  title: "Vocabulary · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function VocabularyPage() {
  const entries = listEntries({ limit: 500 });
  const stats = getDueStats();
  return <VocabularyClient initialEntries={entries} initialStats={stats} />;
}
