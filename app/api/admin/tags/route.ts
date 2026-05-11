import { NextResponse, type NextRequest } from "next/server";

import { getAuthedFromCookie } from "@/lib/auth-server";
import { createTag, listTagsWithCounts } from "@/lib/links-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ tags: listTagsWithCounts() });
}

export async function POST(req: NextRequest) {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { name?: unknown };
  try {
    body = (await req.json()) as { name?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  try {
    const tag = createTag(name);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create_failed" },
      { status: 400 },
    );
  }
}
