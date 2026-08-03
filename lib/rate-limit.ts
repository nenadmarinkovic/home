type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const GLOBAL_MAX_ATTEMPTS = 60;

const buckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, resetAt: 0 };

export function checkLoginRate(key: string): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();

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
