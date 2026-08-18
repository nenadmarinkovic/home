import type { EntryListItem, VocabularyEntry } from "@/lib/vocabulary-db";

export type ClientEntry = EntryListItem;
export type ClientVocabularyEntry = VocabularyEntry;

export type Example = { de: string; sr: string };

export type DraftEntry = {
  id?: number;
  term: string;
  pos: string;
  gender: string | null;
  plural: string | null;
  aux: string | null;
  separable: boolean | null;
  level: string | null;
  translationSr: string;
  examples: Example[];
  conjugations: Record<string, unknown>;
  notes: string;
  tags: string;
  source: string;
};

export function entryToDraft(entry: ClientVocabularyEntry): DraftEntry {
  return {
    id: entry.id,
    term: entry.term,
    pos: entry.pos,
    gender: entry.gender ?? null,
    plural: entry.plural ?? null,
    aux: entry.aux ?? null,
    separable: entry.separable ?? null,
    level: entry.level ?? null,
    translationSr: entry.translationSr,
    examples: entry.examples,
    conjugations: entry.conjugations,
    notes: entry.notes,
    tags: entry.tags,
    source: entry.source,
  };
}

export function emptyDraft(term = ""): DraftEntry {
  return {
    term,
    pos: "noun",
    gender: null,
    plural: null,
    aux: null,
    separable: null,
    level: null,
    translationSr: "",
    examples: [],
    conjugations: {},
    notes: "",
    tags: "",
    source: "manual",
  };
}
