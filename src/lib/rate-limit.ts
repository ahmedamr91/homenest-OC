import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// When Upstash env vars are present, limits are shared across all serverless
// instances; otherwise we fall back to per-instance in-memory counting.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;

function prune(now: number) {
  // Sweep expired buckets so the map cannot grow without bound.
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  if (redis) {
    try {
      const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec);
      if (count > limit) {
        const ttl = await redis.ttl(key);
        return { ok: false, retryAfterSec: ttl > 0 ? ttl : windowSec };
      }
      return { ok: true, retryAfterSec: 0 };
    } catch {
      // Redis unavailable — fall through to in-memory limiting.
    }
  }

  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "local"
  );
}
