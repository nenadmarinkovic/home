import "server-only";

import { z } from "zod";

import {
  AUX_VALUES,
  CEFR_VALUES,
  GENDER_VALUES,
  POS_VALUES,
} from "@/db/schema";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

// Mistral has gone through several naming conventions; pick whatever the user
// has on their account. `mistral-large-latest` is the safe default for tasks
// that need accuracy (linguistic analysis); `mistral-small-latest` is cheaper
// for plain translations.
const ENRICH_MODEL = process.env.MISTRAL_MODEL ?? "mistral-large-latest";
const TRANSLATE_MODEL =
  process.env.MISTRAL_TRANSLATE_MODEL ?? "mistral-small-latest";
const SUMMARIZE_MODEL =
  process.env.MISTRAL_SUMMARIZE_MODEL ?? "mistral-small-latest";

function apiKey(): string {
  const key = process.env.MISTRAL_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "MISTRAL_API_KEY is not set. Add it to .env.local before using the lib feature.",
    );
  }
  return key;
}

const ExampleSchema = z.object({
  de: z.string().min(1),
  sr: z.string().min(1),
});

export const EnrichedEntrySchema = z.object({
  term: z.string().min(1),
  lemma: z.string().min(1),
  pos: z.enum(POS_VALUES),
  gender: z.enum(GENDER_VALUES).nullable().optional(),
  plural: z.string().nullable().optional(),
  aux: z.enum(AUX_VALUES).nullable().optional(),
  separable: z.boolean().nullable().optional(),
  level: z.enum(CEFR_VALUES).nullable().optional(),
  translationSr: z.string().min(1),
  examples: z.array(ExampleSchema).max(4).default([]),
  conjugations: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().default(""),
});

export type EnrichedEntry = z.infer<typeof EnrichedEntrySchema>;

const ENRICH_SYSTEM_PROMPT = `You are a German↔Serbian linguistic assistant. For a given German word or short phrase, output a single JSON object with this exact shape:

{
  "term": string,            // the input, normalized (nouns capitalized, no leading article)
  "lemma": string,           // lowercase dictionary form key (verbs in infinitive, nouns lowercased)
  "pos": "noun"|"verb"|"adjective"|"adverb"|"pronoun"|"preposition"|"conjunction"|"article"|"numeral"|"interjection"|"phrase"|"other",
  "gender": "der"|"die"|"das"|null,   // null unless pos === "noun"
  "plural": string|null,              // e.g. "Häuser"; null if not applicable
  "aux": "haben"|"sein"|"both"|null,  // null unless pos === "verb"
  "separable": boolean|null,          // null unless pos === "verb"
  "level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2"|null,
  "translationSr": string,            // best Serbian translation(s), comma-separated for multiple senses
  "examples": [{ "de": string, "sr": string }],   // 1-3 example sentences with Serbian translation
  "conjugations": object,             // for verbs: { praesens: {...}, praeteritum: {...}, perfekt: string, partizip2: string }; for nouns: { nominativ_pl: string, genitiv_sg: string }; otherwise {}
  "notes": string                     // optional usage notes; "" if none
}

Rules:
- Always output valid JSON. No prose, no markdown fences.
- Use German orthography exactly (umlauts, ß).
- Do not invent unusual senses; pick the most common.`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function chatJSON(
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mistral ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Mistral returned an empty response");
  }
  return content;
}

export async function enrichTerm(
  rawTerm: string,
  signal?: AbortSignal,
): Promise<EnrichedEntry> {
  const term = rawTerm.trim();
  if (!term) throw new Error("Empty term");

  const content = await chatJSON(
    ENRICH_MODEL,
    [
      { role: "system", content: ENRICH_SYSTEM_PROMPT },
      { role: "user", content: term },
    ],
    signal,
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Mistral returned non-JSON content: ${content.slice(0, 200)}`);
  }
  return EnrichedEntrySchema.parse(parsed);
}

const TRANSLATE_SYSTEM_PROMPT = `You translate between German (de) and Serbian (sr). Output a JSON object exactly: {"translation": string}. No prose, no markdown.`;

const TranslateResponseSchema = z.object({ translation: z.string().min(1) });

export type TranslationDirection = "de_sr" | "sr_de";

export async function translate(
  text: string,
  direction: TranslationDirection,
  signal?: AbortSignal,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const [from, to] = direction === "de_sr" ? ["German", "Serbian"] : ["Serbian", "German"];
  const content = await chatJSON(
    TRANSLATE_MODEL,
    [
      { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
      { role: "user", content: `Translate from ${from} to ${to}:\n\n${trimmed}` },
    ],
    signal,
  );
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Mistral returned non-JSON content: ${content.slice(0, 200)}`);
  }
  return TranslateResponseSchema.parse(parsed).translation;
}

const SUMMARIZE_SYSTEM_PROMPT = `You summarize articles the way a thoughtful friend would mention one over coffee — so someone scrolling Bluesky understands why it's worth their time without feeling sold to.

Voice:
- Plain, human, sincere. Like a person, not a press release.
- Everyday words over jargon. If a term is essential, use it without showing off.
- Curious and warm. Never hype-y, never breathless, never "must-read".
- Match the article's own register; don't impose enthusiasm it doesn't have.

Shape:
- 2-3 short sentences. Stop when the point is made.
- Lead with what the article actually says or asks, not what it "explores" or "delves into".
- Use active verbs. Cut filler like "in this article", "the author argues that", "interestingly".
- No bullets, no preamble ("Here is", "This piece"), no quotation marks wrapping the output, no hashtags, no emojis.

Author and pronouns:
- Prefer talking about the ideas, not the person. Most summaries should not mention the author at all.
- If you do refer to the author, use their actual name as it appears in the article (e.g. "Joanna").
- Never guess gender. Do not use "he" or "she" unless the article itself uses that pronoun for the person. If unsure, use the name, or rephrase to avoid pronouns, or use singular "they".

Output only the summary itself — nothing else.`;

export async function summarize(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty text");
  const truncated = trimmed.slice(0, 16000);

  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: SUMMARIZE_MODEL,
      messages: [
        { role: "system", content: SUMMARIZE_SYSTEM_PROMPT },
        { role: "user", content: truncated },
      ],
      temperature: 0.5,
    }),
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mistral ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Mistral returned an empty response");
  }
  return content.trim();
}
