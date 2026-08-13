import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionCookie,
  isValidSessionCookie,
  SESSION_COOKIE_NAME,
  shouldRefreshSessionCookie,
} from "@/lib/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  const candidate = origin ?? referer;
  if (!candidate) return false;
  try {
    const url = new URL(candidate);
    return url.host === host;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSessionCookie(cookie);

  if (!authed) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const response = NextResponse.next();

  if (shouldRefreshSessionCookie(cookie)) {
    const fresh = await createSessionCookie();
    response.cookies.set(fresh.name, fresh.value, fresh.options);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/articles/:path*",
    "/api/dokploy/:path*",
    "/api/export/:path*",
    "/api/lib/:path*",
    "/api/logout/:path*",
    "/api/preview/:path*",
    "/writing/preview",
  ],
};
