import { NextResponse } from "next/server";

import { listTags } from "@/lib/links-db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export const dynamic = "force-dynamic";

export function GET() {
  const tags = listTags().map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
  }));
  return NextResponse.json({ tags }, { headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
