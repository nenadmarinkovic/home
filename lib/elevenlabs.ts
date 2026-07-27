import "server-only";

import { createHash } from "node:crypto";

const TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Sarah — one of the default voices, which is what a free plan is allowed to
// use over the API. Library voices 402 unless the account is paid.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";
const OUTPUT_FORMAT = process.env.ELEVENLABS_OUTPUT_FORMAT ?? "mp3_44100_128";

// Only turbo/flash v2.5 and v3 accept `language_code`; multilingual_v2 rejects it.
const SUPPORTS_LANGUAGE_CODE = /(turbo_v2_5|flash_v2_5|_v3)/.test(MODEL);

export const MAX_SPEAK_CHARS = 500;

function apiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Add it to .env.local before using listening.",
    );
  }
  return key;
}

function voiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
}

function contentTypeFor(format: string): string {
  if (format.startsWith("mp3")) return "audio/mpeg";
  if (format.startsWith("opus")) return "audio/ogg";
  if (format.startsWith("ulaw")) return "audio/basic";
  if (format.startsWith("pcm")) return "audio/wave";
  return "application/octet-stream";
}

export function speechEtag(text: string): string {
  const hash = createHash("sha256")
    .update(`${MODEL} ${OUTPUT_FORMAT} ${voiceId()} ${text}`)
    .digest("base64url")
    .slice(0, 27);
  return `"${hash}"`;
}

const CACHE_MAX_ENTRIES = 200;
const cache = new Map<string, Uint8Array<ArrayBuffer>>();

function cacheGet(key: string): Uint8Array<ArrayBuffer> | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

function cacheSet(key: string, audio: Uint8Array<ArrayBuffer>): void {
  cache.set(key, audio);
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

export type Speech = {
  audio: Uint8Array<ArrayBuffer>;
  contentType: string;
  etag: string;
};

export async function synthesizeGerman(
  text: string,
  options?: { signal?: AbortSignal },
): Promise<Speech> {
  const etag = speechEtag(text);
  const contentType = contentTypeFor(OUTPUT_FORMAT);

  const hit = cacheGet(etag);
  if (hit) return { audio: hit, contentType, etag };

  const url = new URL(`${TTS_URL}/${voiceId()}`);
  url.searchParams.set("output_format", OUTPUT_FORMAT);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey(),
      "content-type": "application/json",
      accept: contentType,
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      ...(SUPPORTS_LANGUAGE_CODE ? { language_code: "de" } : {}),
    }),
    signal: options?.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new Error("ElevenLabs rejected the API key (401)");
    }
    if (res.status === 402) {
      throw new Error(
        `Voice "${voiceId()}" needs a paid ElevenLabs plan — set ELEVENLABS_VOICE_ID to a default voice`,
      );
    }
    if (res.status === 404) {
      throw new Error(
        `ElevenLabs has no voice "${voiceId()}" — set ELEVENLABS_VOICE_ID to one from your account`,
      );
    }
    if (res.status === 429) {
      throw new Error("ElevenLabs rate limit hit — try again in a moment");
    }
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }

  const audio = new Uint8Array(await res.arrayBuffer());
  if (audio.byteLength === 0) {
    throw new Error("ElevenLabs returned empty audio");
  }

  cacheSet(etag, audio);
  return { audio, contentType, etag };
}
