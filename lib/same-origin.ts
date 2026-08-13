/**
 * A request is same-origin when its `Origin` (or, failing that, `Referer`)
 * host matches the `Host` it was sent to.
 *
 * This is the CSRF guard for anything authenticated by the session cookie.
 * Browsers set `Origin` on every non-GET request and will not let a page forge
 * it, so a cross-site form post — the one shape that slips past CORS, because
 * `enctype="text/plain"` sends no preflight and `req.json()` never inspects the
 * content type — arrives carrying the attacker's origin and is rejected here.
 *
 * Absent both headers the answer is `false`: only same-origin browser traffic
 * needs the cookie path, and non-browser callers authenticate by bearer token.
 */
export function isSameOriginRequest(headers: Headers): boolean {
  const host = headers.get("host");
  if (!host) return false;
  const candidate = headers.get("origin") ?? headers.get("referer");
  if (!candidate) return false;
  try {
    return new URL(candidate).host === host;
  } catch {
    return false;
  }
}
