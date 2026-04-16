import { RateLimiterMemory } from "rate-limiter-flexible";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const limiterCache = new Map<string, RateLimiterMemory>();

function getLimiter(maxRequests: number, windowMs: number): RateLimiterMemory {
  const cacheKey = `${maxRequests}:${windowMs}`;
  const existingLimiter = limiterCache.get(cacheKey);
  if (existingLimiter) {
    return existingLimiter;
  }

  const limiter = new RateLimiterMemory({
    points: maxRequests,
    duration: Math.max(1, Math.ceil(windowMs / 1000)),
    keyPrefix: "chat-api",
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = getLimiter(maxRequests, windowMs);

  try {
    const result = await limiter.consume(key, 1);

    return {
      allowed: true,
      remaining: result.remainingPoints,
      retryAfterSeconds: Math.max(1, Math.ceil(result.msBeforeNext / 1000)),
    };
  } catch (error) {
    const rejectedResult = error as { msBeforeNext?: number };
    const retryAfterMs = rejectedResult.msBeforeNext ?? windowMs;

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  return "unknown";
}