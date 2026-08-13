import { NextResponse } from "next/server";

import { renderMarkdown } from "@/lib/markdown";
import { dateLabelFor } from "@/app/writing/articles";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BODY = 500_000;

export async function POST(request: Request) {
  let payload: { body?: unknown; date?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body : "";
  if (body.length > MAX_BODY) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }

  const date = typeof payload.date === "string" ? payload.date : "";
  const dateLabel = ISO_DATE.test(date)
    ? dateLabelFor(date)
    : dateLabelFor(new Date().toISOString().slice(0, 10));

  try {
    return NextResponse.json({ html: renderMarkdown(body), dateLabel });
  } catch (err: unknown) {
    console.error("preview render failed", err);
    return NextResponse.json({ error: "Render failed" }, { status: 500 });
  }
}
