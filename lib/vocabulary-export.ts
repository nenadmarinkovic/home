import { asc } from "drizzle-orm";

import { db } from "@/db/client";
import {
  POS_VALUES,
  reviewLog,
  srsCards,
  vocabularyEntries,
  type Pos,
  type ReviewLogRow,
  type SrsCardRow,
  type VocabularyEntryRow,
} from "@/db/schema";

export type Example = { de: string; sr: string };

export type ExportEntry = Omit<VocabularyEntryRow, "examples" | "conjugations"> & {
  examples: Example[];
  conjugations: Record<string, unknown>;
};

export type VocabularyExport = {
  exportedAt: string;
  counts: { entries: number; cards: number; reviewLog: number };
  entries: ExportEntry[];
  cards: SrsCardRow[];
  reviewLog: ReviewLogRow[];
};

export type ExportFile = {
  path: string;
  content: string;
};

function safeJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToEntry(row: VocabularyEntryRow): ExportEntry {
  return {
    ...row,
    examples: safeJSON<Example[]>(row.examples, []),
    conjugations: safeJSON<Record<string, unknown>>(row.conjugations, {}),
  };
}

export function buildVocabularyExport(at: Date = new Date()): VocabularyExport {
  const entryRows = db
    .select()
    .from(vocabularyEntries)
    .orderBy(asc(vocabularyEntries.lemma), asc(vocabularyEntries.pos))
    .all();
  const cardRows = db
    .select()
    .from(srsCards)
    .orderBy(asc(srsCards.entryId), asc(srsCards.direction))
    .all();
  const logRows = db
    .select()
    .from(reviewLog)
    .orderBy(asc(reviewLog.id))
    .all();

  return {
    exportedAt: at.toISOString(),
    counts: {
      entries: entryRows.length,
      cards: cardRows.length,
      reviewLog: logRows.length,
    },
    entries: entryRows.map(rowToEntry),
    cards: cardRows,
    reviewLog: logRows,
  };
}

const POS_LABELS: Record<Pos, string> = {
  noun: "Nouns",
  verb: "Verbs",
  adjective: "Adjectives",
  adverb: "Adverbs",
  pronoun: "Pronouns",
  preposition: "Prepositions",
  conjunction: "Conjunctions",
  article: "Articles",
  numeral: "Numerals",
  interjection: "Interjections",
  phrase: "Phrases",
  sentence: "Sentences",
  other: "Other",
};

function renderConjugations(conjugations: Record<string, unknown>): string[] {
  const keys = Object.keys(conjugations);
  if (keys.length === 0) return [];
  const lines = ["", "<details><summary>Conjugations</summary>", "", "```json"];
  lines.push(JSON.stringify(conjugations, null, 2));
  lines.push("```", "", "</details>");
  return lines;
}

function renderEntry(entry: ExportEntry): string[] {
  const heading = entry.translationSr
    ? `### ${entry.term} — ${entry.translationSr}`
    : `### ${entry.term}`;
  const lines = [heading, ""];

  const facts: string[] = [];
  if (entry.gender) facts.push(`**Gender:** ${entry.gender}`);
  if (entry.plural) facts.push(`**Plural:** ${entry.plural}`);
  if (entry.aux) facts.push(`**Aux:** ${entry.aux}`);
  if (entry.separable) facts.push(`**Separable:** yes`);
  if (entry.level) facts.push(`**Level:** ${entry.level}`);
  if (entry.tags) facts.push(`**Tags:** ${entry.tags}`);
  if (facts.length > 0) lines.push(facts.join(" · "), "");

  if (entry.notes.trim()) lines.push(entry.notes.trim(), "");

  for (const ex of entry.examples) {
    if (!ex.de && !ex.sr) continue;
    lines.push(ex.sr ? `- _${ex.de}_ — ${ex.sr}` : `- _${ex.de}_`);
  }
  if (entry.examples.length > 0) lines.push("");

  lines.push(...renderConjugations(entry.conjugations));
  lines.push("");
  return lines;
}

export function buildVocabularyMarkdown(data: VocabularyExport): string {
  const date = data.exportedAt.slice(0, 10);
  const lines = [
    "# German–Serbian Vocabulary",
    "",
    `_${data.counts.entries} entries · exported ${date}_`,
    "",
  ];

  const byPos = new Map<string, ExportEntry[]>();
  for (const entry of data.entries) {
    const list = byPos.get(entry.pos) ?? [];
    list.push(entry);
    byPos.set(entry.pos, list);
  }

  const orderedPos = [
    ...POS_VALUES.filter((pos) => byPos.has(pos)),
    ...[...byPos.keys()].filter(
      (pos) => !POS_VALUES.includes(pos as Pos),
    ),
  ];

  for (const pos of orderedPos) {
    const entries = byPos.get(pos) ?? [];
    if (entries.length === 0) continue;
    const label = POS_LABELS[pos as Pos] ?? pos;
    lines.push(`## ${label} (${entries.length})`, "");
    for (const entry of entries) {
      lines.push(...renderEntry(entry));
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function buildVocabularyExportFiles(at: Date = new Date()): ExportFile[] {
  const data = buildVocabularyExport(at);
  return [
    { path: "content/vocabulary/entries.md", content: buildVocabularyMarkdown(data) },
    {
      path: "content/vocabulary/entries.json",
      content: `${JSON.stringify(data, null, 2)}\n`,
    },
  ];
}
