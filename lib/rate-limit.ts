type Bucket = { count: number; resetAt: number };

type RateResult = { allowed: boolean; retryAfterMs: number };

function createLimiter(config: {
  windowMs: number;
  max: number;
  globalMax: number;
}): (key: string) => RateResult {
  const buckets = new Map<string, Bucket>();
  const globalBucket: Bucket = { count: 0, resetAt: 0 };

  return (key: string) => {
    const now = Date.now();

    if (globalBucket.resetAt <= now) {
      globalBucket.count = 0;
      globalBucket.resetAt = now + config.windowMs;
    }
    if (globalBucket.count >= config.globalMax) {
      return { allowed: false, retryAfterMs: globalBucket.resetAt - now };
    }
    globalBucket.count += 1;

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + config.windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }
    if (bucket.count >= config.max) {
      return { allowed: false, retryAfterMs: bucket.resetAt - now };
    }
    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  };
}

export const checkLoginRate = createLimiter({
  windowMs: 60_000,
  max: 10,
  globalMax: 60,
});

export const checkContactRate = createLimiter({
  windowMs: 10 * 60_000,
  max: 3,
  globalMax: 30,
});
