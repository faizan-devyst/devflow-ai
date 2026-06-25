"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  PiPlus,
  PiCaretDown,
  PiClipboardText,
  PiSparkle,
  PiX,
} from "react-icons/pi";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StandupCard } from "@/components/standup/standup-card";
import { StandupFormDialog } from "@/components/standup/standup-form-dialog";
import { StandupInsightsDialog } from "@/components/standup/standup-insights-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStandups, deleteStandup } from "@/store/slices/standupSlice";
import type { StandupWithAuthor } from "@/types";

const PAGE_SIZE = 6;

type FormState = { mode: "create" | "edit"; standup: StandupWithAuthor | null };

export function StandupPageClient() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { teams, currentTeamId, loading: teamsLoading } = useAppSelector((state) => state.teams);
  const { items, loading } = useAppSelector((state) => state.standups);

  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StandupWithAuthor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  useEffect(() => {
    if (!currentTeamId) return;
    dispatch(fetchStandups({ teamId: currentTeamId }))
      .unwrap()
      .catch((error: Error) => toast.error(error.message));
  }, [currentTeamId, dispatch]);

  const members = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((standup) => {
      if (!map.has(standup.user.id)) map.set(standup.user.id, standup.user.name || standup.user.email);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((standup) => {
        if (memberFilter !== "all" && standup.user.id !== memberFilter) return false;
        if (dateFilter && new Date(standup.date).toISOString().slice(0, 10) !== dateFilter)
          return false;
        return true;
      }),
    [items, memberFilter, dateFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = memberFilter !== "all" || dateFilter !== "";
  const memberLabel =
    memberFilter === "all"
      ? "All members"
      : members.find((member) => member.id === memberFilter)?.name ?? "All members";

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    dispatch(deleteStandup(deleteTarget.id))
      .unwrap()
      .then(() => {
        toast.success("Standup deleted");
        setDeleteTarget(null);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setDeleting(false));
  };

  // No team yet — point the user at the sidebar switcher (persistent inline guidance)
  if (!teamsLoading && teams.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Daily Standups" description="Share progress and stay in sync." />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <PiClipboardText className="size-8 text-canvas-text" />
          <p className="text-canvas-text-contrast font-medium">Create a team to get started</p>
          <p className="max-w-sm text-sm text-canvas-text">
            Standups are scoped to a team. Use the team switcher in the sidebar to create your first
            team, then come back here to post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Daily Standups" description="Share progress and stay in sync.">
        <Button
          variant="outline"
          onClick={() => setInsightsOpen(true)}
          disabled={!currentTeamId || items.length === 0}
        >
          <PiSparkle />
          AI insights
        </Button>
        <Button onClick={() => setFormState({ mode: "create", standup: null })} disabled={!currentTeamId}>
          <PiPlus />
          New standup
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span className="truncate">{memberLabel}</span>
              <PiCaretDown className="size-4 text-canvas-text" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onSelect={() => { setMemberFilter("all"); setPage(1); }}>
              All members
            </DropdownMenuItem>
            {members.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onSelect={() => { setMemberFilter(member.id); setPage(1); }}
              >
                <span className="truncate">{member.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="date"
          value={dateFilter}
          onChange={(event) => { setDateFilter(event.target.value); setPage(1); }}
          className="w-auto"
          aria-label="Filter by date"
        />

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setMemberFilter("all"); setDateFilter(""); setPage(1); }}
          >
            <PiX />
            Clear
          </Button>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
        {loading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))
        ) : paged.length > 0 ? (
          paged.map((standup) => (
            <StandupCard
              key={standup.id}
              standup={standup}
              canManage={standup.user.id === currentUserId}
              onEdit={(target) => setFormState({ mode: "edit", standup: target })}
              onDelete={(target) => setDeleteTarget(target)}
            />
          ))
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center">
            <PiClipboardText className="size-8 text-canvas-text" />
            <p className="text-canvas-text-contrast font-medium">
              {hasFilters ? "No standups match your filters" : "No standups yet"}
            </p>
            <p className="max-w-sm text-sm text-canvas-text">
              {hasFilters
                ? "Try clearing the filters to see the full feed."
                : "Post the first standup to kick off your team's daily updates."}
            </p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="pt-3">
          <DataTablePagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}

      {formState && currentTeamId && (
        <StandupFormDialog
          open
          onOpenChange={(open) => { if (!open) setFormState(null); }}
          teamId={currentTeamId}
          mode={formState.mode}
          standup={formState.standup}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete standup?"
        description="This permanently removes this standup entry. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />

      {insightsOpen && currentTeamId && (
        <StandupInsightsDialog
          open
          onOpenChange={setInsightsOpen}
          teamId={currentTeamId}
          defaultDate={dateFilter}
        />
      )}
    </div>
  );
}
