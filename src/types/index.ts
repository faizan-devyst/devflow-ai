import type { IconType } from "react-icons";
import type { Session, AuthUser } from "@/lib/auth";
import type {
  Team,
  TeamMember,
  Standup,
  Repository,
  CodeChunk,
  Invitation,
  Prisma,
} from "@/generated/prisma/client";
// Value-import enums from the standalone, browser-safe enums module so client
// components can use them without pulling the Node Prisma client into the bundle.
import { Role, AppRole, RepoStatus, InviteStatus } from "@/generated/prisma/enums";

export type { Session, AuthUser, Team, TeamMember, Standup, Repository, CodeChunk, Invitation };
export { Role, AppRole, RepoStatus, InviteStatus };

export type TeamWithRole = Team & { role: Role };

// Human-readable labels for the team-scoped roles (UI + emails).
export const ROLE_LABEL: Record<Role, string> = {
  [Role.TEAM_LEAD]: "Team Lead",
  [Role.MEMBER]: "Member",
};

// Member row joined with its user, for the team management page.
export type TeamMemberWithUser = Prisma.TeamMemberGetPayload<{
  include: { user: { select: { id: true; name: true; email: true; image: true } } };
}>;

// Pending/past invitation joined with the inviter's display name.
export type InvitationWithInviter = Prisma.InvitationGetPayload<{
  include: { invitedBy: { select: { id: true; name: true; email: true } } };
}>;

export type StandupWithAuthor = Prisma.StandupGetPayload<{
  include: { user: { select: { id: true; name: true; image: true; email: true } } };
}>;

// Projection returned by the raw pgvector similarity query (not a Prisma model row)
export interface CodeChunkMatch {
  id: string;
  path: string;
  language: string | null;
  content: string;
  startLine: number;
  endLine: number;
  similarity: number;
}

// Source reference sent alongside a RAG chat answer (via the x-sources header)
export interface ChatSource {
  n: number;
  path: string;
  startLine: number;
  endLine: number;
  similarity: number;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  icon: IconType;
}

export interface SocialLink extends NavLink {
  icon: IconType;
}
