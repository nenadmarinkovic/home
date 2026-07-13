import { NextResponse } from "next/server";

import { getAuthedFromCookie } from "@/lib/auth-server";
import { ALLOWED_IMAGE_MIME, saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 },
    );
  }

  try {
    const saved = await saveImage(file);
    return NextResponse.json({ url: saved.url });
  } catch (err) {
    console.error("image upload failed", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
