import { NextResponse, type NextRequest } from "next/server";

import { readBearerToken, verifyApiToken } from "@/lib/api-token";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { fetchPageTitle } from "@/lib/page-text";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const bearerOk = verifyApiToken(
    readBearerToken(req.headers.get("authorization")),
  );
  const cookieOk = bearerOk || (await getAuthedFromCookie());
  if (!bearerOk && !cookieOk) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const url = new URL(req.url).searchParams.get("url")?.trim() ?? "";
  if (!url) {
    return NextResponse.json(
      { error: "url_required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  try {
    return NextResponse.json(
      { title: await fetchPageTitle(url) },
      {
        headers: CORS_HEADERS,
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Could not fetch the page.",
      },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
