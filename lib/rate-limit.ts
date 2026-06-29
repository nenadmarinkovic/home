type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
// Backstop across *all* keys. The per-IP key comes from `x-forwarded-for`,
// which a client can spoof to mint a fresh per-IP bucket on every request, so
// the per-IP limit alone doesn't bound a determined brute-forcer. A global cap
// does. It sits well above what a single legitimate admin would hit in a
// minute, so honest logins are never throttled, but a flood is capped.
const GLOBAL_MAX_ATTEMPTS = 60;

const buckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, resetAt: 0 };

export function checkLoginRate(key: string): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();

  // Global backstop first — a spoofed-IP flood is bounded here no matter how
  // many distinct per-IP buckets it creates.
  if (globalBucket.resetAt <= now) {
    globalBucket.count = 0;
    globalBucket.resetAt = now + WINDOW_MS;
  }
  if (globalBucket.count >= GLOBAL_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: globalBucket.resetAt - now };
  }
  globalBucket.count += 1;

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
