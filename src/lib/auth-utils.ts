import { auth } from "@/lib/auth";
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
 * Return a standard 400 Bad Request response.
 * Use this when request validation fails.
 */
export function badRequestResponse(message = "Bad Request", details?: any) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
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
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
