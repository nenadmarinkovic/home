import { GRAMMAR_SECTIONS } from "./grammar-sections";

export type Hit = { text: string; at: number; length: number };

export type SectionResult = {
  id: string;
  label: string;
  hint: string;
  hits: Hit[];
  total: number;
};

type IndexedSection = { id: string; label: string; hint: string; lines: string[] };

const MAX_HITS_PER_SECTION = 6;
const IDEAL_SNIPPET = 70;
const MAX_SNIPPET = 190;

/**
 * Serbian and German diacritics folded one character at a time, so positions in
 * the folded string still line up with the original and can be used to
 * highlight the match.
 */
const FOLD: Record<string, string> = {
  č: "c",
  ć: "c",
  š: "s",
  ž: "z",
  đ: "d",
  ä: "a",
  ö: "o",
  ü: "u",
  ß: "s",
};

export function fold(value: string): string {
  return value.toLowerCase().replace(/[čćšžđäöüß]/g, (c) => FOLD[c] ?? c);
}

/**
 * Sections are authored as React elements whose text lives in props (`title`,
 * `lead`, `head`, `rows`, `items`, children). Walking the unrendered tree
 * collects all of it without needing the content duplicated into a separate
 * index.
 */
function walk(node: unknown, out: string[]): void {
  if (node == null || typeof node === "boolean" || typeof node === "function") {
    return;
  }
  if (typeof node === "string") {
    const plain = node.replace(/\*/g, "").trim();
    if (plain.length > 1) out.push(plain);
    return;
  }
  if (typeof node === "number") return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, out);
    return;
  }
  const props = (node as { props?: unknown }).props;
  if (props && typeof props === "object") {
    for (const value of Object.values(props as Record<string, unknown>)) {
      walk(value, out);
    }
  }
}

/** Keeps a long line readable by windowing it around the match. */
function clamp(hit: Hit): Hit {
  if (hit.text.length <= MAX_SNIPPET) return hit;
  const start = Math.max(0, hit.at - 60);
  const end = Math.min(hit.text.length, start + MAX_SNIPPET);
  const lead = start > 0 ? "…" : "";
  const tail = end < hit.text.length ? "…" : "";
  return {
    text: `${lead}${hit.text.slice(start, end)}${tail}`,
    at: hit.at - start + lead.length,
    length: hit.length,
  };
}

let cached: IndexedSection[] | null = null;

function buildIndex(): IndexedSection[] {
  if (cached) return cached;
  cached = GRAMMAR_SECTIONS.map((section) => {
    const lines: string[] = [];
    walk(section.render(), lines);
    return {
      id: section.id,
      label: section.label,
      hint: section.hint,
      lines: Array.from(new Set(lines)),
    };
  });
  return cached;
}

export function searchGrammar(query: string): SectionResult[] {
  const needle = fold(query.trim());
  if (needle.length < 2) return [];

  const results: SectionResult[] = [];
  for (const section of buildIndex()) {
    const found: Hit[] = [];
    const labelMatch = fold(`${section.label} ${section.hint}`).includes(needle);

    for (const line of section.lines) {
      const at = fold(line).indexOf(needle);
      if (at === -1) continue;
      found.push({ text: line, at, length: needle.length });
    }

    if (found.length > 0 || labelMatch) {
      // A bare table header matches as readily as a full sentence, so prefer
      // the lines closest to a comfortable snippet length.
      const hits = found
        .slice()
        .sort(
          (a, b) =>
            Math.abs(a.text.length - IDEAL_SNIPPET) -
            Math.abs(b.text.length - IDEAL_SNIPPET),
        )
        .slice(0, MAX_HITS_PER_SECTION)
        .map(clamp);

      results.push({
        id: section.id,
        label: section.label,
        hint: section.hint,
        hits,
        total: found.length,
      });
    }
  }

  return results.sort((a, b) => b.total - a.total);
}
