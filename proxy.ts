import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionCookie,
  isValidSessionCookie,
  SESSION_COOKIE_NAME,
  shouldRefreshSessionCookie,
} from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/same-origin";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSessionCookie(cookie);

  if (!authed) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    // Keep the query string: /save carries the shared URL there, so dropping it
    // would land a freshly logged-in share-sheet hand-off on an empty form.
    loginUrl.searchParams.set(
      "from",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (
    !SAFE_METHODS.has(request.method) &&
    !isSameOriginRequest(request.headers)
  ) {
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
    "/save",
    "/writing/preview",
  ],
};
