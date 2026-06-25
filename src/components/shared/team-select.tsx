"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PiCaretUpDown,
  PiPlus,
  PiCheck,
  PiUsersThree,
  PiSpinner,
  PiTrash,
} from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeams, createTeam, deleteTeam, setCurrentTeam } from "@/store/slices/teamSlice";
import { useSession } from "@/lib/auth-client";
import { AppRole } from "@/types";

export function TeamSelect() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { teams, currentTeamId, loading, creating } = useAppSelector((state) => state.teams);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchTeams())
      .unwrap()
      .catch((error: Error) => toast.error(error.message));
  }, [dispatch]);

  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null;
  // Only the global Owner can create or delete teams.
  const isOwner = session?.user?.appRole === AppRole.OWNER;

  const openCreateDialog = () => {
    setName("");
    setDialogOpen(true);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Team name must be at least 2 characters");
      return;
    }
    try {
      const team = await dispatch(createTeam({ name: trimmed })).unwrap();
      toast.success(`Team "${team.name}" created`);
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create team");
    }
  };

  const handleDelete = () => {
    if (!currentTeam) return;
    setDeleting(true);
    dispatch(deleteTeam(currentTeam.id))
      .unwrap()
      .then(() => {
        toast.success(`Team "${currentTeam.name}" deleted`);
        setDeleteOpen(false);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setDeleting(false));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2"
            disabled={loading && teams.length === 0}
          >
            <span className="flex items-center gap-2 truncate">
              <PiUsersThree className="size-4 shrink-0 text-primary-text" />
              <span className="truncate">
                {currentTeam ? currentTeam.name : teams.length ? "Select team" : "No team yet"}
              </span>
            </span>
            <PiCaretUpDown className="size-4 shrink-0 text-canvas-text" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onSelect={() => dispatch(setCurrentTeam(team.id))}
              className="justify-between gap-2"
            >
              <span className="truncate">{team.name}</span>
              {team.id === currentTeamId && <PiCheck className="size-4 text-primary-text" />}
            </DropdownMenuItem>
          ))}
          {isOwner && teams.length > 0 && <DropdownMenuSeparator />}
          {isOwner && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openCreateDialog();
              }}
            >
              <PiPlus className="size-4" />
              Create team
            </DropdownMenuItem>
          )}
          {currentTeam && isOwner && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setDeleteOpen(true);
              }}
              className="text-alert-text"
            >
              <PiTrash className="size-4" />
              Delete team
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a team</DialogTitle>
            <DialogDescription>
              Teams scope your standups and connected repositories. You'll join as a Team Lead and
              can invite members from the Team page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Engineering"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating && <PiSpinner className="mr-2 size-4 animate-spin" />}
                Create team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => { if (!open) setDeleteOpen(false); }}
        title="Delete team?"
        description={
          currentTeam
            ? `This permanently deletes "${currentTeam.name}" along with its standups and connected repositories. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete team"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
