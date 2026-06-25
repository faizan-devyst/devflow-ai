"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PiCaretDown, PiSpinner } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createInvitation } from "@/store/slices/invitationsSlice";
import { Role, ROLE_LABEL } from "@/types";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  // Owners may invite Team Leads; Team Leads may invite Members only.
  canInviteLead: boolean;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  teamId,
  canInviteLead,
}: InviteMemberDialogProps) {
  const dispatch = useAppDispatch();
  const sending = useAppSelector((state) => state.invitations.sending);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.MEMBER);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setEmail("");
      setRole(Role.MEMBER);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter an email address");
      return;
    }
    try {
      await dispatch(createInvitation({ email: trimmed, teamId, role })).unwrap();
      toast.success(`Invitation sent to ${trimmed}`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email with a link to set their password and join the team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            {canInviteLead ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {ROLE_LABEL[role]}
                    <PiCaretDown className="size-4 text-canvas-text" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuItem onSelect={() => setRole(Role.MEMBER)}>
                    {ROLE_LABEL[Role.MEMBER]}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setRole(Role.TEAM_LEAD)}>
                    {ROLE_LABEL[Role.TEAM_LEAD]}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <p className="text-sm text-canvas-text">
                Invited as a <span className="text-canvas-text-contrast">Member</span>.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={sending}>
              {sending && <PiSpinner className="mr-2 size-4 animate-spin" />}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
