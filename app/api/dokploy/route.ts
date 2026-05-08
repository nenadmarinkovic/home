import { NextResponse } from "next/server";

import { fetchDokploySnapshot } from "@/lib/dokploy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchDokploySnapshot();
  if (!result.ok) {
    const status = result.reason === "auth" ? 502 : result.reason === "config" ? 503 : 502;
    return NextResponse.json({ error: result.error, reason: result.reason }, { status });
  }
  return NextResponse.json({ ok: true, ...result.snapshot });
}
