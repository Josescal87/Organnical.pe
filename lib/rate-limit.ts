// Rate limiting con Upstash Redis. Graceful degrade si las env vars no están
// configuradas — el código en routes funciona igual sin protección.
//
// Dos interfaces:
//   - `rateLimit(name, identifier, limit, window)` — nueva (organnical-store)
//   - `checkRateLimit(key, limit, windowMs)` — legada (Organnical.pe existente)

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Window = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    _redis = new Redis({ url, token })
    return _redis
  } catch (err) {
    console.error("rate-limit: failed to init Redis client:", err)
    return null
  }
}

const limiterCache = new Map<string, Ratelimit | null>()

function getLimiter(name: string, limit: number, window: Window): Ratelimit | null {
  const cacheKey = `${name}:${limit}:${window}`
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey) ?? null
  const redis = getRedis()
  if (!redis) {
    limiterCache.set(cacheKey, null)
    return null
  }
  try {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: true,
      prefix: `organnical:${name}`,
    })
    limiterCache.set(cacheKey, rl)
    return rl
  } catch (err) {
    console.error("rate-limit: failed to init Ratelimit:", err)
    limiterCache.set(cacheKey, null)
    return null
  }
}

export interface RateLimitResult {
  ok: boolean
  limit?: number
  remaining?: number
  reset?: number
}

/** Nueva interfaz — usada por API routes de tienda. */
export async function rateLimit(
  name: string,
  identifier: string,
  limit: number,
  window: Window = "60 s"
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window)
  if (!limiter) return { ok: true }
  try {
    const result = await limiter.limit(identifier)
    return { ok: result.success, limit: result.limit, remaining: result.remaining, reset: result.reset }
  } catch (err) {
    console.error("rate-limit:", name, err)
    return { ok: true }
  }
}

/** Interfaz legada — usada por API routes de telemedicina existentes. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const windowSecs = Math.ceil(windowMs / 1000)
  const result = await rateLimit("legacy", key, limit, `${windowSecs} s`)
  return result.ok
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

export function tooManyRequestsResponse(reset?: number): Response {
  const retryAfter = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 1000)) : 60
  return new Response(
    JSON.stringify({ error: "Demasiadas requests. Inténtalo de nuevo en un momento." }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
    }
  )
}
