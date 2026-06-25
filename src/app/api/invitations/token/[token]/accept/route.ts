import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { badRequestResponse } from "@/lib/auth-utils";

const acceptSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Public: accept an invitation. Creates the account for the invited email (the
// before/after auth hooks gate it and wire up team membership), then signs in.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
    return NextResponse.json({ error: "This invitation is no longer valid" }, { status: 410 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid input");

  const requestHeaders = await headers();
  try {
    // Email is taken from the invitation, never the client — the hooks then add the
    // team membership and mark the invite accepted.
    await auth.api.signUpEmail({
      body: { email: invitation.email, password: parsed.data.password, name: parsed.data.name },
      headers: requestHeaders,
    });
    // autoSignIn is off, so establish the session explicitly (sets the cookie via nextCookies).
    await auth.api.signInEmail({
      body: { email: invitation.email, password: parsed.data.password },
      headers: requestHeaders,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: "Could not accept the invitation. You may already have an account — try signing in." },
        { status: 400 }
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
