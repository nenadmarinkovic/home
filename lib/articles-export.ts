import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { articles, LANGUAGES, type Language } from "@/db/schema";

export type ExportFile = {
  language: Language;
  slug: string;
  path: string;
  content: string;
};

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
  date: string;
  body: string;
}): string {
  const lines = [
    "---",
    `title: ${yamlEscape(row.title)}`,
    `subtitle: ${yamlEscape(row.subtitle)}`,
    `description: ${yamlEscape(row.description)}`,
    `date: ${row.date}`,
    "---",
    "",
  ];
  return `${lines.join("\n")}${row.body.trim()}\n`;
}

export function buildExportFiles(): ExportFile[] {
  const files: ExportFile[] = [];
  for (const lang of LANGUAGES) {
    const rows = db
      .select()
      .from(articles)
      .where(eq(articles.language, lang))
      .all()
      .filter((r) => !r.draft);
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
