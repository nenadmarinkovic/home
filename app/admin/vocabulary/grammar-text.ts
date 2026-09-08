import { GRAMMAR_SECTIONS } from "./grammar-sections";

export type GrammarSectionText = {
  id: string;
  label: string;
  hint: string;
  content: string;
};

function clean(value: string): string {
  return value.replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

function inline(node: unknown): string {
  if (node == null || typeof node === "boolean" || typeof node === "function") {
    return "";
  }
  if (typeof node === "string") return clean(node);
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(inline).filter(Boolean).join(" ");
  }
  const props = (node as { props?: unknown }).props;
  if (props && typeof props === "object") {
    return Object.values(props as Record<string, unknown>)
      .map(inline)
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function serialize(node: unknown, out: string[]): void {
  if (node == null || typeof node === "boolean" || typeof node === "function") {
    return;
  }
  if (typeof node === "string") {
    const text = clean(node);
    if (text) out.push(text);
    return;
  }
  if (typeof node === "number") return;
  if (Array.isArray(node)) {
    for (const child of node) serialize(child, out);
    return;
  }

  const props = (node as { props?: Record<string, unknown> }).props;
  if (!props || typeof props !== "object") return;

  const { title, lead, head, rows, items, children } = props;

  if (typeof title === "string" && title) out.push(`## ${clean(title)}`);
  if (typeof lead === "string" && lead) out.push(clean(lead));

  if (Array.isArray(head) && Array.isArray(rows)) {
    out.push(head.map(inline).join(" | "));
    for (const row of rows) {
      if (Array.isArray(row)) out.push(row.map(inline).join(" | "));
    }
  } else if (Array.isArray(items)) {
    for (const item of items) {
      if (Array.isArray(item)) {
        const [de, sr, label] = item as unknown[];
        const tag = label ? `(${inline(label)}) ` : "";
        out.push(`- ${tag}${inline(de)} = ${inline(sr)}`);
      } else {
        out.push(`- ${inline(item)}`);
      }
    }
  }

  serialize(children, out);
}

const cache = new Map<string, GrammarSectionText>();

export function getGrammarSectionText(id: string): GrammarSectionText | null {
  const cached = cache.get(id);
  if (cached) return cached;

  const section = GRAMMAR_SECTIONS.find((s) => s.id === id);
  if (!section) return null;

  const lines: string[] = [];
  serialize(section.render(), lines);

  const text: GrammarSectionText = {
    id: section.id,
    label: section.label,
    hint: section.hint,
    content: lines.join("\n"),
  };
  cache.set(id, text);
  return text;
}

export function grammarSectionLabels(): string[] {
  return GRAMMAR_SECTIONS.map((s) => s.label);
}
