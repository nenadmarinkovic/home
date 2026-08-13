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
