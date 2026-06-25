import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/teams";
import { unauthorizedResponse, forbiddenResponse, badRequestResponse } from "@/lib/auth-utils";
import { sendInvitationEmail } from "@/lib/email";
import { ROLE_LABEL } from "@/types";
import type { InvitationWithInviter } from "@/types";

const EXPIRY_DAYS = 7;

// Regenerate the token + expiry of a pending invitation and re-send the email.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id }, include: { team: true } });
  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (!(await canManageTeam(session, invitation.teamId))) return forbiddenResponse();
  if (invitation.status === "ACCEPTED") return badRequestResponse("That invitation was already accepted");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const updated: InvitationWithInviter = await prisma.invitation.update({
    where: { id },
    data: { token, expiresAt, status: "PENDING" },
    include: { invitedBy: { select: { id: true, name: true, email: true } } },
  });

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${token}`;
  await sendInvitationEmail(invitation.email, {
    inviterName: session.user.name,
    teamName: invitation.team.name,
    roleLabel: ROLE_LABEL[invitation.role],
    acceptUrl,
  });

  return NextResponse.json(updated);
}
