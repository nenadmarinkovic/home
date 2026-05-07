import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const LANGUAGES = ["en", "sr", "de"] as const;
export type Language = (typeof LANGUAGES)[number];

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    language: text("language").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    description: text("description").notNull().default(""),
    body: text("body").notNull(),
    draft: integer("draft", { mode: "boolean" }).notNull().default(true),
    date: text("date").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    exportedAt: integer("exported_at", { mode: "timestamp" }),
  },
  (table) => [uniqueIndex("articles_slug_lang_unique").on(table.slug, table.language)],
);

export type ArticleRow = typeof articles.$inferSelect;
export type NewArticleRow = typeof articles.$inferInsert;
