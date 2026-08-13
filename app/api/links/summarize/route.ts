import { NextResponse, type NextRequest } from "next/server";

import { readBearerToken, verifyApiToken } from "@/lib/api-token";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { summarize } from "@/lib/mistral";
import { fetchPageText } from "@/lib/page-text";
import { isSameOriginRequest } from "@/lib/same-origin";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const bearerOk = verifyApiToken(
    readBearerToken(req.headers.get("authorization")),
  );
  const cookieOk =
    bearerOk ||
    (isSameOriginRequest(req.headers) && (await getAuthedFromCookie()));
  if (!bearerOk && !cookieOk) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  let body: { url?: unknown; text?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json(
      { error: "url_required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  let text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 200) {
    try {
      text = await fetchPageText(url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Could not fetch the page.",
        },
        { status: 502, headers: CORS_HEADERS },
      );
    }
  }
  if (text.length < 200) {
    return NextResponse.json(
      { error: "Not enough readable text on the page to summarize." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  try {
    const summary = await summarize(text);
    return NextResponse.json({ summary }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate a summary.",
      },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
