const COOKIE_NAME = "admin_session";
// Long-lived so a phone-installed PWA stays logged in across days/weeks.
// The cookie's HMAC binds it to AUTH_SECRET, so rotating that secret revokes
// every outstanding session.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days
// When a cookie is older than this, the proxy will mint a fresh one on the
// next authenticated request — sliding the expiration so active users never
// hit the hard TTL.
const SESSION_REFRESH_AFTER_SECONDS = 60 * 60 * 24 * 7; // 7 days

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET env var must be set to a string of at least 32 chars",
    );
  }
  return secret;
}

function getValidAfterMs(): number {
  const raw = process.env.AUTH_VALID_AFTER;
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

async function hmacSha256Hex(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionCookie(): Promise<{
  name: string;
  value: string;
  options: CookieOptions;
}> {
  const issued = Date.now().toString();
  const value = `${issued}.${await hmacSha256Hex(issued)}`;
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export function clearSessionCookie(): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  };
}

export async function isValidSessionCookie(
  value: string | undefined,
): Promise<boolean> {
  if (!value) return false;
  const idx = value.indexOf(".");
  if (idx === -1) return false;
  const issued = value.slice(0, idx);
  const signature = value.slice(idx + 1);
  if (!issued || !signature) return false;
  const expectedSig = await hmacSha256Hex(issued);
  if (!constantTimeEqualString(signature, expectedSig)) return false;
  const issuedMs = Number(issued);
  if (!Number.isFinite(issuedMs)) return false;
  if (issuedMs < getValidAfterMs()) return false;
  const ageSec = (Date.now() - issuedMs) / 1000;
  return ageSec >= 0 && ageSec < SESSION_TTL_SECONDS;
}

/**
 * True when a valid cookie is old enough that we should mint a fresh one to
 * slide the expiration forward. Cheap path — assumes the caller has already
 * confirmed validity with `isValidSessionCookie`.
 */
export function shouldRefreshSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const idx = value.indexOf(".");
  if (idx === -1) return false;
  const issuedMs = Number(value.slice(0, idx));
  if (!Number.isFinite(issuedMs)) return false;
  const ageSec = (Date.now() - issuedMs) / 1000;
  return ageSec > SESSION_REFRESH_AFTER_SECONDS;
}

/**
 * Returns true when `target` is a safe local path to redirect to.
 * Rejects schemes, protocol-relative (//host) paths, and backslashes.
 */
export function isSafeRedirectTarget(target: unknown): target is string {
  if (typeof target !== "string" || target.length === 0) return false;
  if (target.length > 512) return false;
  if (!target.startsWith("/")) return false;
  if (target.startsWith("//") || target.startsWith("/\\")) return false;
  if (target.includes("\\")) return false;
  return true;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
