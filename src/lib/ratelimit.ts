import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Lazily initialised so the Redis client is only created at request time,
// not during Next.js build analysis when env vars are not present.
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

type LimiterConfig = { window: Parameters<typeof Ratelimit.slidingWindow>[1]; max: number; prefix: string };

const _limiters: Record<string, Ratelimit> = {};
function getLimiter({ window, max, prefix }: LimiterConfig): Ratelimit {
  if (!_limiters[prefix]) {
    _limiters[prefix] = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(max, window),
      prefix,
    });
  }
  return _limiters[prefix];
}

export const chatLimiter      = { _cfg: { max: 10, window: "1 m" as const, prefix: "rl:chat" } };
export const chatBurstLimiter = { _cfg: { max: 5,  window: "30 s" as const, prefix: "rl:chat-burst" } };
export const visionLimiter    = { _cfg: { max: 5,  window: "1 m" as const, prefix: "rl:vision" } };
export const exportLimiter    = { _cfg: { max: 5,  window: "1 m" as const, prefix: "rl:export" } };
export const billingLimiter   = { _cfg: { max: 5,  window: "1 m" as const, prefix: "rl:billing" } };

type LazyLimiter = { _cfg: LimiterConfig };

/**
 * Returns a 429 NextResponse if the identifier is rate-limited, otherwise null.
 * identifier: userId for authed routes, IP for public routes.
 */
export async function checkRateLimit(
  lazyLimiter: LazyLimiter,
  identifier: string
): Promise<NextResponse | null> {
  const limiter = getLimiter(lazyLimiter._cfg);
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (success) return null;
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}
