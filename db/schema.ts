import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const LANGUAGES = ["en", "sr", "de"] as const;
export type Language = (typeof LANGUAGES)[number];

export const POS_VALUES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "article",
  "numeral",
  "interjection",
  "phrase",
  "other",
] as const;
export type Pos = (typeof POS_VALUES)[number];

export const GENDER_VALUES = ["der", "die", "das"] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const AUX_VALUES = ["haben", "sein", "both"] as const;
export type Aux = (typeof AUX_VALUES)[number];

export const CEFR_VALUES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Cefr = (typeof CEFR_VALUES)[number];

export const CARD_DIRECTIONS = ["de_sr", "sr_de"] as const;
export type CardDirection = (typeof CARD_DIRECTIONS)[number];

// FSRS card lifecycle states. Numeric values mirror the `ts-fsrs` State enum:
// 0 New, 1 Learning, 2 Review, 3 Relearning.
export type CardState = 0 | 1 | 2 | 3;

// FSRS rating values. Mirror the `ts-fsrs` Rating enum:
// 1 Again, 2 Hard, 3 Good, 4 Easy.
export type Rating = 1 | 2 | 3 | 4;

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

export const vocabEntries = sqliteTable(
  "vocab_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // The German headword as the user typed it (preserves capitalization for nouns).
    term: text("term").notNull(),
    // Lowercased lemma key used for de-duping (e.g. "gehen", "haus").
    lemma: text("lemma").notNull(),
    pos: text("pos").notNull(),
    gender: text("gender"),
    plural: text("plural"),
    aux: text("aux"),
    separable: integer("separable", { mode: "boolean" }),
    level: text("level"),
    // Primary translation in Serbian, comma-separated if multiple senses.
    translationSr: text("translation_sr").notNull().default(""),
    // JSON array: [{ de: string, sr: string }]
    examples: text("examples").notNull().default("[]"),
    // JSON object: arbitrary conjugation/declension table from Mistral.
    conjugations: text("conjugations").notNull().default("{}"),
    notes: text("notes").notNull().default(""),
    // Comma-separated tags, lowercased.
    tags: text("tags").notNull().default(""),
    source: text("source").notNull().default("manual"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("vocab_entries_lemma_pos_unique").on(table.lemma, table.pos),
    index("vocab_entries_lemma_idx").on(table.lemma),
  ],
);

export type VocabEntryRow = typeof vocabEntries.$inferSelect;
export type NewVocabEntryRow = typeof vocabEntries.$inferInsert;

export const srsCards = sqliteTable(
  "srs_cards",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entryId: integer("entry_id")
      .notNull()
      .references(() => vocabEntries.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(),
    // FSRS state. See ts-fsrs Card type for field meanings.
    due: integer("due", { mode: "timestamp_ms" }).notNull(),
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(0),
    elapsedDays: real("elapsed_days").notNull().default(0),
    scheduledDays: real("scheduled_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    state: integer("state").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    lastReview: integer("last_review", { mode: "timestamp_ms" }),
    suspended: integer("suspended", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("srs_cards_entry_direction_unique").on(
      table.entryId,
      table.direction,
    ),
    index("srs_cards_due_idx").on(table.due),
  ],
);

export type SrsCardRow = typeof srsCards.$inferSelect;
export type NewSrsCardRow = typeof srsCards.$inferInsert;

export const reviewLog = sqliteTable(
  "review_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cardId: integer("card_id")
      .notNull()
      .references(() => srsCards.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    state: integer("state").notNull(),
    due: integer("due", { mode: "timestamp_ms" }).notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    elapsedDays: real("elapsed_days").notNull(),
    lastElapsedDays: real("last_elapsed_days").notNull(),
    scheduledDays: real("scheduled_days").notNull(),
    learningSteps: integer("learning_steps").notNull().default(0),
    review: integer("review", { mode: "timestamp_ms" }).notNull(),
    durationMs: integer("duration_ms").notNull().default(0),
  },
  (table) => [index("review_log_card_idx").on(table.cardId)],
);

export type ReviewLogRow = typeof reviewLog.$inferSelect;
export type NewReviewLogRow = typeof reviewLog.$inferInsert;

export const LINK_TYPES = ["article", "video", "social", "podcast", "other"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;

export const links = sqliteTable(
  "links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    url: text("url").notNull(),
    title: text("title").notNull().default(""),
    type: text("type").notNull().default("article"),
    note: text("note").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("links_url_unique").on(table.url)],
);

export type LinkRow = typeof links.$inferSelect;
export type NewLinkRow = typeof links.$inferInsert;

export const linkTags = sqliteTable(
  "link_tags",
  {
    linkId: integer("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("link_tags_unique").on(table.linkId, table.tagId),
    index("link_tags_tag_idx").on(table.tagId),
  ],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
