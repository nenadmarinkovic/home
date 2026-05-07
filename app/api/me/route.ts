import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isValidSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSessionCookie(session);
  return NextResponse.json(
    { authed },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
