import { NextResponse } from "next/server";

import { MAX_SPEAK_CHARS, speechEtag, synthesizeGerman } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "private, max-age=31536000, immutable";

export async function GET(request: Request) {
  const text = (new URL(request.url).searchParams.get("text") ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  if (text.length > MAX_SPEAK_CHARS) {
    return NextResponse.json(
      { error: `text too long (max ${MAX_SPEAK_CHARS} characters)` },
      { status: 400 },
    );
  }

  const etag = speechEtag(text);
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: { etag, "cache-control": CACHE_CONTROL },
    });
  }

  try {
    const speech = await synthesizeGerman(text, { signal: request.signal });
    return new Response(speech.audio, {
      headers: {
        "content-type": speech.contentType,
        "content-length": String(speech.audio.byteLength),
        "cache-control": CACHE_CONTROL,
        etag: speech.etag,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Speech failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
