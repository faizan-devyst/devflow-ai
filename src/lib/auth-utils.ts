import { auth } from "@/lib/auth";
import type { Session } from "@/lib/auth";
import { AppRole } from "@/generated/prisma/enums";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Retrieve the current authenticated session.
 * Use this in API routes that require authentication.
 *
 * @returns Session object with user info, or null if not authenticated
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

/**
 * Return a standard 401 Unauthorized response.
 * Use this in API routes when session is missing or invalid.
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Return a standard 403 Forbidden response.
 * Use this when the caller is authenticated but lacks permission.
 */
export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * True when the session belongs to the single global app Owner.
 */
export function isAppOwner(session: Session | null): boolean {
  return session?.user?.appRole === AppRole.OWNER;
}

/**
 * Return a standard 400 Bad Request response.
 * Use this when request validation fails.
 */
export function badRequestResponse(message = "Bad Request", details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

/**
 * Return a standard 500 Internal Server Error response.
 * Use this for unexpected errors.
 */
export function internalErrorResponse(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Return a standard 200 success response with data.
 */
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
