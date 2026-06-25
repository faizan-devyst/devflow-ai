"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PiUserPlus,
  PiUsersThree,
  PiDotsThree,
  PiTrash,
  PiArrowClockwise,
  PiEnvelopeSimple,
} from "react-icons/pi";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembers, updateMemberRole, removeMember } from "@/store/slices/membersSlice";
import {
  fetchInvitations,
  resendInvitation,
  revokeInvitation,
} from "@/store/slices/invitationsSlice";
import { AppRole, Role, ROLE_LABEL } from "@/types";
import type { TeamMemberWithUser, InvitationWithInviter } from "@/types";

function initialsOf(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamPageClient() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const isOwner = session?.user?.appRole === AppRole.OWNER;

  const { teams, currentTeamId, loading: teamsLoading } = useAppSelector((state) => state.teams);
  const { items: members, loading: membersLoading } = useAppSelector((state) => state.members);
  const { items: invitations, loading: invitesLoading } = useAppSelector(
    (state) => state.invitations
  );

  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;
  const canManage = isOwner || currentTeam?.role === Role.TEAM_LEAD;

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMemberWithUser | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<InvitationWithInviter | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!currentTeamId) return;
    dispatch(fetchMembers(currentTeamId))
      .unwrap()
      .catch((error: Error) => toast.error(error.message));
  }, [currentTeamId, dispatch]);

  useEffect(() => {
    if (!currentTeamId || !canManage) return;
    dispatch(fetchInvitations(currentTeamId))
      .unwrap()
      .catch((error: Error) => toast.error(error.message));
  }, [currentTeamId, canManage, dispatch]);

  const handleRoleChange = (member: TeamMemberWithUser, role: Role) => {
    if (!currentTeamId || member.role === role) return;
    dispatch(updateMemberRole({ teamId: currentTeamId, userId: member.userId, role }))
      .unwrap()
      .then(() => toast.success(`${member.user.name} is now a ${ROLE_LABEL[role]}`))
      .catch((error: Error) => toast.error(error.message));
  };

  const handleRemove = () => {
    if (!currentTeamId || !removeTarget) return;
    setActing(true);
    dispatch(removeMember({ teamId: currentTeamId, userId: removeTarget.userId }))
      .unwrap()
      .then(() => {
        toast.success(`${removeTarget.user.name} removed from the team`);
        setRemoveTarget(null);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setActing(false));
  };

  const handleResend = (invitation: InvitationWithInviter) => {
    dispatch(resendInvitation(invitation.id))
      .unwrap()
      .then(() => toast.success(`Invitation re-sent to ${invitation.email}`))
      .catch((error: Error) => toast.error(error.message));
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    setActing(true);
    dispatch(revokeInvitation(revokeTarget.id))
      .unwrap()
      .then(() => {
        toast.success("Invitation revoked");
        setRevokeTarget(null);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setActing(false));
  };

  // No team yet — guide the user to the sidebar switcher.
  if (!teamsLoading && teams.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Team" description="Manage who has access to this workspace." />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <PiUsersThree className="size-8 text-canvas-text" />
          <p className="font-medium text-canvas-text-contrast">No team yet</p>
          <p className="max-w-sm text-sm text-canvas-text">
            {isOwner
              ? "Create a team from the sidebar switcher, then invite teammates here."
              : "You'll see your team here once you've been added to one."}
          </p>
        </div>
      </div>
    );
  }

  const visibleInvites = invitations.filter((invite) => invite.status !== "ACCEPTED");

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Team" description="Manage who has access to this workspace.">
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} disabled={!currentTeamId}>
            <PiUserPlus />
            Invite
          </Button>
        )}
      </PageHeader>

      <div className="flex-1 space-y-8 overflow-y-auto pt-6 pr-1">
        {/* Members */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-canvas-text-contrast">Members</h2>
          <div className="divide-y divide-canvas-border/50 rounded-xl border border-canvas-border/50 bg-canvas-bg-subtle">
            {membersLoading && members.length === 0
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              : members.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-4">
                      <div className="flex size-9 shrink-0 select-none items-center justify-center rounded-full border border-canvas-border/50 bg-primary-bg text-xs font-semibold text-primary-text">
                        {initialsOf(member.user.name || member.user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-canvas-text-contrast">
                          {member.user.name}
                          {isSelf && <span className="ml-1 text-canvas-text">(you)</span>}
                        </p>
                        <p className="truncate text-sm text-canvas-text">{member.user.email}</p>
                      </div>
                      <Badge variant={member.role === Role.TEAM_LEAD ? "default" : "secondary"}>
                        {ROLE_LABEL[member.role]}
                      </Badge>
                      {canManage && !isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Manage member">
                              <PiDotsThree className="size-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-44">
                            {isOwner && (
                              <>
                                <DropdownMenuLabel>Change role</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onSelect={() => handleRoleChange(member, Role.TEAM_LEAD)}
                                >
                                  {ROLE_LABEL[Role.TEAM_LEAD]}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleRoleChange(member, Role.MEMBER)}
                                >
                                  {ROLE_LABEL[Role.MEMBER]}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-alert-text"
                              onSelect={(event) => {
                                event.preventDefault();
                                setRemoveTarget(member);
                              }}
                            >
                              <PiTrash className="size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
          </div>
        </section>

        {/* Pending invitations — managers only */}
        {canManage && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-canvas-text-contrast">Invitations</h2>
            <div className="rounded-xl border border-canvas-border/50 bg-canvas-bg-subtle">
              {invitesLoading && invitations.length === 0 ? (
                <div className="p-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : visibleInvites.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <PiEnvelopeSimple className="size-7 text-canvas-text" />
                  <p className="text-sm text-canvas-text">No pending invitations.</p>
                </div>
              ) : (
                <div className="divide-y divide-canvas-border/50">
                  {visibleInvites.map((invite) => {
                    const expired =
                      invite.status === "PENDING" && new Date(invite.expiresAt) <= new Date();
                    const statusLabel = expired ? "Expired" : invite.status.toLowerCase();
                    const isPending = invite.status === "PENDING" && !expired;
                    return (
                      <div key={invite.id} className="flex items-center gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-canvas-text-contrast">
                            {invite.email}
                          </p>
                          <p className="truncate text-sm text-canvas-text">
                            Invited by {invite.invitedBy.name}
                          </p>
                        </div>
                        <Badge variant="secondary">{ROLE_LABEL[invite.role]}</Badge>
                        <Badge variant={isPending ? "outline" : "destructive"} className="capitalize">
                          {statusLabel}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Resend invitation"
                            onClick={() => handleResend(invite)}
                          >
                            <PiArrowClockwise className="size-4" />
                          </Button>
                          {isPending && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Revoke invitation"
                              className="text-alert-text"
                              onClick={() => setRevokeTarget(invite)}
                            >
                              <PiTrash className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {currentTeamId && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={currentTeamId}
          canInviteLead={isOwner}
        />
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title="Remove member?"
        description={
          removeTarget
            ? `${removeTarget.user.name} will lose access to this team's standups and repositories.`
            : undefined
        }
        confirmLabel="Remove"
        loading={acting}
        onConfirm={handleRemove}
      />

      <ConfirmDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
        title="Revoke invitation?"
        description={
          revokeTarget
            ? `The invitation link sent to ${revokeTarget.email} will stop working.`
            : undefined
        }
        confirmLabel="Revoke"
        loading={acting}
        onConfirm={handleRevoke}
      />
    </div>
  );
}
