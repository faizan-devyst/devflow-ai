import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/auth";
import { isAppOwner } from "@/lib/auth-utils";
import { Role } from "@/generated/prisma/enums";

/**
 * Returns the caller's membership row for a team, or null if they are not a member.
 * Use this to authorize team-scoped reads/writes before touching team data.
 */
export function getTeamMembership(userId: string, teamId: string) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
}

/**
 * True if the caller may manage a team's people (invite, change role, remove):
 * the app Owner for any team, or a Team Lead of that specific team.
 */
export async function canManageTeam(session: Session | null, teamId: string): Promise<boolean> {
  if (isAppOwner(session)) return true;
  if (!session) return false;
  const membership = await getTeamMembership(session.user.id, teamId);
  return membership?.role === Role.TEAM_LEAD;
}

/**
 * True if the caller may invite someone with `targetRole` into a team.
 * Owner can invite any role into any team; a Team Lead can invite only Members
 * into a team they lead.
 */
export async function canInviteRole(
  session: Session | null,
  teamId: string,
  targetRole: Role
): Promise<boolean> {
  if (isAppOwner(session)) return true;
  if (!session || targetRole !== Role.MEMBER) return false;
  const membership = await getTeamMembership(session.user.id, teamId);
  return membership?.role === Role.TEAM_LEAD;
}
