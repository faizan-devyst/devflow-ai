import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/types";

// Public: resolve an invite token for the accept page. No auth — the token is the secret.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { team: { select: { name: true } } },
  });

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
    return NextResponse.json({ error: "This invitation is no longer valid" }, { status: 410 });
  }

  return NextResponse.json({
    email: invitation.email,
    teamName: invitation.team.name,
    role: invitation.role,
    roleLabel: ROLE_LABEL[invitation.role],
  });
}
