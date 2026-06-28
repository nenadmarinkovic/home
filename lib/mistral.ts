import "server-only";

import { z } from "zod";

import {
  AUX_VALUES,
  CEFR_VALUES,
  GENDER_VALUES,
  POS_VALUES,
} from "@/db/schema";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_TRANSCRIBE_URL = "https://api.mistral.ai/v1/audio/transcriptions";

// Voxtral is Mistral's speech model; the mini tier is plenty for short
// single-word/sentence dictation and keeps latency low.
const TRANSCRIBE_MODEL =
  process.env.MISTRAL_TRANSCRIBE_MODEL ?? "voxtral-mini-latest";

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

// Transcribe a recorded audio blob to text. We deliberately do NOT pin a
// `language`: the lib accepts both German and Serbian input (enrichTerm
// translates Serbian → German), so letting Voxtral auto-detect keeps both
// dictation directions working.
export async function transcribeAudio(
  file: Blob,
  filename: string,
  signal?: AbortSignal,
): Promise<string> {
  const form = new FormData();
  form.append("model", TRANSCRIBE_MODEL);
  // Voxtral keys the decoder off the file extension, so pass a sensible name.
  form.append("file", file, filename);

  // Note: do not set content-type by hand — fetch derives the multipart
  // boundary from the FormData body automatically.
  const res = await fetch(MISTRAL_TRANSCRIBE_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey()}` },
    body: form,
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mistral ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { text?: string };
  const text = data.text?.trim();
  if (!text) {
    throw new Error("Mistral returned an empty transcription");
  }
  return text;
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

const ENRICH_SYSTEM_PROMPT = `You are a German↔Serbian linguistic assistant. The input is in German or Serbian and may be a single word, a short noun phrase, a fixed expression, or a full sentence.

First decide which mode to produce, based on the input:

MODE A — single-item entry. Choose this when the input is one word, a short noun phrase, or a fixed idiomatic expression that maps to a single dictionary lemma in German. Produce a vocabulary entry for the German headword. Set pos to its true category (noun/verb/adjective/etc.).

MODE B — sentence entry. Choose this when the input is a full sentence (the user wants to learn how to SAY this in German). Translate the WHOLE sentence to natural, idiomatic German and store the whole German sentence as the term. Do NOT reduce to a single headword. Set pos to "sentence". gender, plural, aux, separable, conjugations stay null/empty.

Heuristics:
- Has a finite verb and a subject, ends with a sentence-ending punctuation, or is 4+ words of clearly clause-shaped text → MODE B.
- Otherwise → MODE A.

Output JSON shape (same shape for both modes):

{
  "term": string,            // MODE A: German headword, normalized (nouns capitalized, no leading article). MODE B: the full German sentence.
  "lemma": string,           // MODE A: lowercase dictionary form. MODE B: lowercase form of the German sentence (used as a stable key).
  "pos": "noun"|"verb"|"adjective"|"adverb"|"pronoun"|"preposition"|"conjunction"|"article"|"numeral"|"interjection"|"phrase"|"sentence"|"other",
  "gender": "der"|"die"|"das"|null,   // null unless pos === "noun"
  "plural": string|null,              // null unless pos === "noun"
  "aux": "haben"|"sein"|"both"|null,  // null unless pos === "verb"
  "separable": boolean|null,          // null unless pos === "verb"
  "level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2"|null,
  "translationSr": string,            // MODE A: Serbian translation(s), comma-separated for multiple senses. MODE B: the full Serbian sentence (preserve the source if input was Serbian).
  "examples": [{ "de": string, "sr": string }],   // 1-3 examples; for MODE B these can be small variations or related sentences
  "conjugations": object,             // verbs: { praesens, praeteritum, perfekt, partizip2 }; nouns: { nominativ_pl, genitiv_sg }; otherwise {}
  "notes": string                     // optional notes (register, formality, when to use); "" if none
}

Rules:
- If the input is in Serbian, translate it to German first and produce the entry for the German term/sentence.
- Prefer natural, conversational German over literal word-for-word translations.
- Always output valid JSON. No prose, no markdown fences.
- Use German orthography exactly (umlauts, ß).
- Write all Serbian content in LATIN script (Gajica), never Cyrillic. Use š, č, ć, ž, đ. If the input is in Cyrillic, transliterate it to Latin before producing the entry.`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const CHAT_MODEL = process.env.MISTRAL_CHAT_MODEL ?? "mistral-small-latest";

async function chatText(
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
    body: JSON.stringify({ model, messages, temperature: 0.5 }),
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

export type EntryChatContext = {
  term: string;
  pos: string;
  translationSr: string;
  gender?: string | null;
  plural?: string | null;
  examples?: { de: string; sr: string }[];
  notes?: string;
};

function buildChatSystemPrompt(entry: EntryChatContext): string {
  const examples =
    entry.examples
      ?.slice(0, 4)
      .map((ex, i) => `${i + 1}. DE: ${ex.de} — SR: ${ex.sr}`)
      .join("\n") ?? "";
  return `You are a warm, patient German tutor who speaks to the learner in Serbian.

You are discussing ONE specific dictionary entry with the user:
- term (DE): ${entry.term}
- part of speech: ${entry.pos}${entry.gender ? `\n- gender: ${entry.gender}` : ""}${entry.plural ? `\n- plural: ${entry.plural}` : ""}
- translation (SR): ${entry.translationSr}
${examples ? `- examples:\n${examples}` : ""}${entry.notes ? `\n- notes: ${entry.notes}` : ""}

Rules:
- Reply ONLY in Serbian, Latin script (Gajica). Never use Cyrillic.
- Stay focused on this entry — grammar, usage, register, etymology, common collocations, pitfalls, related words. Politely steer back if the user drifts off-topic.
- Keep answers concise (2–6 sentences). Use short examples when they help.
- When you give German examples, always pair them with a Serbian translation in parentheses or on the next line.
- No markdown headings, no lists with bullets unless absolutely needed for clarity. Plain conversational prose.`;
}

export async function chatAboutEntry(
  entry: EntryChatContext,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const system = buildChatSystemPrompt(entry);
  return chatText(
    CHAT_MODEL,
    [{ role: "system", content: system }, ...messages],
    signal,
  );
}

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

const EXAMPLES_SYSTEM_PROMPT = `You are a German↔Serbian linguistic assistant. Given a German headword (or phrase/sentence), generate exactly 3 short, natural example sentences in German with Serbian translations.

Rules:
- Output JSON exactly as: {"examples": [{"de": string, "sr": string}, ...]}.
- Use Latin script (Gajica) for Serbian, never Cyrillic.
- Each example ≤ 15 words.
- Make the three examples distinct: different contexts, registers, or grammatical roles.
- Sentences should sound like everyday German, not textbook examples.
- No prose, no markdown.`;

const ExamplesResponseSchema = z.object({
  examples: z
    .array(z.object({ de: z.string().min(1), sr: z.string().min(1) }))
    .min(1)
    .max(5),
});

export async function generateExamples(
  term: string,
  signal?: AbortSignal,
): Promise<{ de: string; sr: string }[]> {
  const trimmed = term.trim();
  if (!trimmed) throw new Error("Empty term");

  const content = await chatJSON(
    TRANSLATE_MODEL,
    [
      { role: "system", content: EXAMPLES_SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
    signal,
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      `Mistral returned non-JSON content: ${content.slice(0, 200)}`,
    );
  }
  return ExamplesResponseSchema.parse(parsed).examples;
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
