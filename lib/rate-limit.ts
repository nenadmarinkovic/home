type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const buckets = new Map<string, Bucket>();

export function checkLoginRate(key: string): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();
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
