import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam, getTeamMembership } from "@/lib/teams";
import { isAppOwner, unauthorizedResponse, forbiddenResponse, badRequestResponse } from "@/lib/auth-utils";
import { Role } from "@/generated/prisma/client";
import type { TeamMemberWithUser } from "@/types";

const updateRoleSchema = z.object({ role: z.enum([Role.TEAM_LEAD, Role.MEMBER]) });

const MEMBER_INCLUDE = {
  user: { select: { id: true, name: true, email: true, image: true } },
} as const;

// Change a member's team role — owner only.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const { id: teamId, userId } = await params;
  if (!isAppOwner(session)) return forbiddenResponse("Only the owner can change roles");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid role");

  if (!(await getTeamMembership(userId, teamId))) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated: TeamMemberWithUser = await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role: parsed.data.role },
    include: MEMBER_INCLUDE,
  });
  return NextResponse.json(updated);
}

// Remove a member. Owner removes anyone (except the global owner); a Team Lead
// may remove only Members of a team they lead.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const { id: teamId, userId } = await params;
  if (!(await canManageTeam(session, teamId))) return forbiddenResponse();

  const target = await getTeamMembership(userId, teamId);
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (targetUser?.appRole === "OWNER") {
    return forbiddenResponse("The owner cannot be removed from a team");
  }
  if (!isAppOwner(session) && target.role !== Role.MEMBER) {
    return forbiddenResponse("Team leads can only remove members");
  }

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  return NextResponse.json({ userId });
}
