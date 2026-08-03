import { NextResponse } from "next/server";

import { transcribeAudio } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "audio file required" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty audio" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "audio too large" }, { status: 413 });
  }

  const filename =
    file instanceof File && file.name ? file.name : "recording.webm";

  const rawLang = form.get("language");
  const language =
    typeof rawLang === "string" && /^(de|sr|hr|en|fr|es|it|pt|nl)$/.test(rawLang)
      ? rawLang
      : undefined;

  try {
    const text = await transcribeAudio(file, filename, { language });
    return NextResponse.json({ ok: true, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcribe failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
