import { NextResponse } from "next/server";

import { getApiToken, rotateApiToken } from "@/lib/api-token";
import { getAuthedFromCookie } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ token: getApiToken() });
}

export async function POST() {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = rotateApiToken();
  return NextResponse.json({ token });
}
