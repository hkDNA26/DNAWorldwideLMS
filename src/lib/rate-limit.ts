/**
 * Small in-process rate limiter for the unauthenticated endpoints.
 *
 * Deliberately in-memory: this runs as a single Railway instance, so a shared
 * store would be more moving parts than the problem warrants today. The tradeoff
 * is that counters reset on deploy and wouldn't be shared if the service is ever
 * scaled to more than one instance — at that point this should move to Redis.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Keeps the map from growing without bound on a long-running instance.
const SWEEP_EVERY_MS = 10 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client address. Railway sits behind a proxy, so the socket address
 * is the proxy's — x-forwarded-for is the only signal available. It's spoofable,
 * which is why this is one layer rather than the whole defence.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function tooManyRequests(retryAfterSeconds: number) {
  return new Response(
    JSON.stringify({ error: "Too many attempts. Please wait a moment and try again." }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSeconds) },
    }
  );
}
