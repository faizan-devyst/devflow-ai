import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canInviteRole, canManageTeam } from "@/lib/teams";
import { unauthorizedResponse, forbiddenResponse, badRequestResponse } from "@/lib/auth-utils";
import { sendInvitationEmail } from "@/lib/email";
import { Role, ROLE_LABEL } from "@/types";
import type { InvitationWithInviter } from "@/types";

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  teamId: z.string().min(1),
  role: z.enum([Role.TEAM_LEAD, Role.MEMBER]),
});

const INVITE_INCLUDE = {
  invitedBy: { select: { id: true, name: true, email: true } },
} as const;

const EXPIRY_DAYS = 7;

// List a team's invitations — owner or that team's lead.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const teamId = new URL(request.url).searchParams.get("teamId");
  if (!teamId) return badRequestResponse("teamId is required");
  if (!(await canManageTeam(session, teamId))) return forbiddenResponse();

  const invitations: InvitationWithInviter[] = await prisma.invitation.findMany({
    where: { teamId },
    include: INVITE_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invitations);
}

// Create + send an invitation.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid input");

  const { email, teamId, role } = parsed.data;
  if (!(await canInviteRole(session, teamId, role))) {
    return forbiddenResponse("You can't invite that role to this team");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Reject if already a member or already has a live pending invite.
  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, user: { email } },
  });
  if (existingMember) return badRequestResponse("That person is already on this team");

  const livePending = await prisma.invitation.findFirst({
    where: { teamId, email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (livePending) return badRequestResponse("An invitation is already pending for that email");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: { email, teamId, role, token, invitedById: session.user.id, expiresAt },
    include: INVITE_INCLUDE,
  });

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${token}`;
  await sendInvitationEmail(email, {
    inviterName: session.user.name,
    teamName: team.name,
    roleLabel: ROLE_LABEL[role],
    acceptUrl,
  });

  return NextResponse.json(invitation, { status: 201 });
}
