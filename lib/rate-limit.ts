import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Shared Redis client — reused across requests
const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache of limiters keyed by "limit:windowSeconds"
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs / 1000} s`),
        analytics: false,
      })
    );
  }
  return limiters.get(key)!;
}

/** Returns true if the request is allowed, false if rate-limited. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  try {
    const limiter = getLimiter(limit, windowMs);
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    // Fail open — don't block requests if Redis is unavailable
    console.error("[rate-limit] Upstash error:", err);
    return true;
  }
}
