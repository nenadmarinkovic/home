import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { articles, LANGUAGES, type Language } from "@/db/schema";

export type ExportFile = {
  language: Language;
  slug: string;
  path: string;
  content: string;
};

export type ExportSelector = { slug: string; language: Language };

function yamlEscape(value: string): string {
  if (/[:#&*!|>'"%@`,?\-{}\[\]]/.test(value) || value !== value.trim()) {
    return JSON.stringify(value);
  }
  return value;
}

function buildMarkdown(row: {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  date: string;
  body: string;
}): string {
  const lines = [
    "---",
    `title: ${yamlEscape(row.title)}`,
    `subtitle: ${yamlEscape(row.subtitle)}`,
    `description: ${yamlEscape(row.description)}`,
    // Omitted when unset, so posts without a share image keep clean
    // frontmatter rather than carrying an empty key.
    ...(row.image ? [`image: ${yamlEscape(row.image)}`] : []),
    `date: ${row.date}`,
    "---",
    "",
  ];
  return `${lines.join("\n")}${row.body.trim()}\n`;
}

export function buildExportFiles(selector?: ExportSelector): ExportFile[] {
  const files: ExportFile[] = [];
  const targetLangs: readonly Language[] = selector
    ? [selector.language]
    : LANGUAGES;
  for (const lang of targetLangs) {
    const rows = db
      .select()
      .from(articles)
      .where(eq(articles.language, lang))
      .all()
      .filter((r) => !r.draft && (!selector || r.slug === selector.slug));
    for (const row of rows) {
      files.push({
        language: lang,
        slug: row.slug,
        path: `content/${lang}/${row.slug}.md`,
        content: buildMarkdown(row),
      });
    }
  }
  return files;
}

export function markExported(targets: ExportSelector[], at: Date = new Date()) {
  if (targets.length === 0) return;
  const byLang = new Map<Language, string[]>();
  for (const t of targets) {
    const list = byLang.get(t.language) ?? [];
    list.push(t.slug);
    byLang.set(t.language, list);
  }
  for (const [lang, slugs] of byLang) {
    db.update(articles)
      .set({ exportedAt: at })
      .where(and(eq(articles.language, lang), inArray(articles.slug, slugs)))
      .run();
  }
}
