import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { isAppOwner, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-utils";
import type { TeamMemberWithUser } from "@/types";

const MEMBER_INCLUDE = {
  user: { select: { id: true, name: true, email: true, image: true } },
} as const;

// List a team's members. Visible to the owner or any member of the team.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const { id: teamId } = await params;
  if (!isAppOwner(session) && !(await getTeamMembership(session.user.id, teamId))) {
    return forbiddenResponse();
  }

  const members: TeamMemberWithUser[] = await prisma.teamMember.findMany({
    where: { teamId },
    include: MEMBER_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(members);
}
