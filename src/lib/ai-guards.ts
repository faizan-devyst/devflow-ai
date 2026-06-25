import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * BYO-key validation: returns a 503 response when the required provider key is not
 * configured, so callers fail fast with a clear message instead of a generic 500.
 */
export function aiKeyError(provider: "anthropic" | "openai"): NextResponse | null {
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI features are not configured on this server (missing ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Code indexing is not configured on this server (missing OPENAI_API_KEY)." },
      { status: 503 }
    );
  }
  return null;
}

/**
 * Per-user, per-scope rate limit for cost-bearing AI routes. Returns a 429 response
 * when the limit is exceeded, otherwise null.
 */
export function aiRateLimitError(
  userId: string,
  scope: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const { ok, retryAfter } = rateLimit(`${scope}:${userId}`, limit, windowMs);
  if (ok) return null;
  return NextResponse.json(
    { error: "You're doing that too fast — please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
