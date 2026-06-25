"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PiPlus, PiGithubLogo } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RepositoryCard } from "@/components/onboarding/repository-card";
import { ConnectRepositoryDialog } from "@/components/onboarding/connect-repository-dialog";
import { RepoSearchDialog } from "@/components/onboarding/repo-search-dialog";
import { RepoChatDialog } from "@/components/onboarding/repo-chat-dialog";
import { OnboardingDocDialog } from "@/components/onboarding/onboarding-doc-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRepositories,
  deleteRepository,
  reindexRepository,
} from "@/store/slices/repositorySlice";
import { RepoStatus, type Repository } from "@/types";

const POLL_MS = 4000;

export function OnboardingPageClient() {
  const dispatch = useAppDispatch();
  const { teams, currentTeamId, loading: teamsLoading } = useAppSelector((state) => state.teams);
  const { items, loading } = useAppSelector((state) => state.repositories);

  const [connectOpen, setConnectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Repository | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTarget, setSearchTarget] = useState<Repository | null>(null);
  const [chatTarget, setChatTarget] = useState<Repository | null>(null);
  const [docTargetId, setDocTargetId] = useState<string | null>(null);
  const docTarget = items.find((repo) => repo.id === docTargetId) ?? null;

  useEffect(() => {
    if (!currentTeamId) return;
    dispatch(fetchRepositories({ teamId: currentTeamId }))
      .unwrap()
      .catch((error: Error) => toast.error(error.message));
  }, [currentTeamId, dispatch]);

  // Poll while any repository is still being indexed
  const hasActive = items.some(
    (repo) => repo.status === RepoStatus.PENDING || repo.status === RepoStatus.INDEXING
  );
  useEffect(() => {
    if (!currentTeamId || !hasActive) return;
    const interval = setInterval(() => {
      dispatch(fetchRepositories({ teamId: currentTeamId }))
        .unwrap()
        .catch(() => {});
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [currentTeamId, hasActive, dispatch]);

  const handleReindex = (repository: Repository) => {
    dispatch(reindexRepository({ id: repository.id }))
      .unwrap()
      .then(() => toast.success("Re-indexing started"))
      .catch((error: Error) => toast.error(error.message));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    dispatch(deleteRepository(deleteTarget.id))
      .unwrap()
      .then(() => {
        toast.success("Repository removed");
        setDeleteTarget(null);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setDeleting(false));
  };

  if (!teamsLoading && teams.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Codebase Onboarding" description="Index a repo and get new teammates up to speed." />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <PiGithubLogo className="size-8 text-canvas-text" />
          <p className="text-canvas-text-contrast font-medium">Create a team to get started</p>
          <p className="max-w-sm text-sm text-canvas-text">
            Repositories are scoped to a team. Use the team switcher in the sidebar to create your
            first team, then connect a repo here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Codebase Onboarding"
        description="Connect a GitHub repo to index its code for AI-powered onboarding."
      >
        <Button onClick={() => setConnectOpen(true)} disabled={!currentTeamId}>
          <PiPlus />
          Connect repository
        </Button>
      </PageHeader>

      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto py-4 p-1">
        {loading && items.length === 0 ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))
        ) : items.length > 0 ? (
          items.map((repository) => (
            <RepositoryCard
              key={repository.id}
              repository={repository}
              onDelete={(target) => setDeleteTarget(target)}
              onReindex={handleReindex}
              onSearch={(target) => setSearchTarget(target)}
              onAsk={(target) => setChatTarget(target)}
              onDoc={(target) => setDocTargetId(target.id)}
            />
          ))
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center">
            <PiGithubLogo className="size-8 text-canvas-text" />
            <p className="text-canvas-text-contrast font-medium">No repositories connected</p>
            <p className="max-w-sm text-sm text-canvas-text">
              Connect a GitHub repository to index its code. Once indexed, your team can explore and
              ask questions about it.
            </p>
          </div>
        )}
      </div>

      {connectOpen && currentTeamId && (
        <ConnectRepositoryDialog open onOpenChange={setConnectOpen} teamId={currentTeamId} />
      )}

      {searchTarget && (
        <RepoSearchDialog
          open
          onOpenChange={(open) => { if (!open) setSearchTarget(null); }}
          repositoryId={searchTarget.id}
          repositoryName={`${searchTarget.owner}/${searchTarget.repo}`}
        />
      )}

      {chatTarget && (
        <RepoChatDialog
          open
          onOpenChange={(open) => { if (!open) setChatTarget(null); }}
          repositoryId={chatTarget.id}
          repositoryName={`${chatTarget.owner}/${chatTarget.repo}`}
        />
      )}

      {docTarget && (
        <OnboardingDocDialog
          open
          onOpenChange={(open) => { if (!open) setDocTargetId(null); }}
          repository={docTarget}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Remove repository?"
        description="This deletes the repository and all of its indexed code chunks. This cannot be undone."
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
