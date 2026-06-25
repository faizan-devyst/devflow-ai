"use client";

import { format } from "date-fns";
import {
  PiGithubLogo,
  PiTrash,
  PiSpinner,
  PiCheckCircle,
  PiWarningCircle,
  PiClock,
  PiStack,
  PiArrowSquareOut,
  PiMagnifyingGlass,
  PiArrowsClockwise,
  PiChatCircle,
  PiBookOpenText,
} from "react-icons/pi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RepoStatus, type Repository } from "@/types";

interface RepositoryCardProps {
  repository: Repository;
  onDelete: (repository: Repository) => void;
  onReindex: (repository: Repository) => void;
  onSearch: (repository: Repository) => void;
  onAsk: (repository: Repository) => void;
  onDoc: (repository: Repository) => void;
}

const STATUS_CONFIG: Record<
  RepoStatus,
  { label: string; className: string; icon: typeof PiClock; spin?: boolean }
> = {
  [RepoStatus.PENDING]: {
    label: "Queued",
    className: "bg-info-bg-subtle text-info-text",
    icon: PiClock,
  },
  [RepoStatus.INDEXING]: {
    label: "Indexing",
    className: "bg-warning-bg-subtle text-warning-text",
    icon: PiSpinner,
    spin: true,
  },
  [RepoStatus.READY]: {
    label: "Ready",
    className: "bg-success-bg-subtle text-success-text",
    icon: PiCheckCircle,
  },
  [RepoStatus.FAILED]: {
    label: "Failed",
    className: "bg-alert-bg-subtle text-alert-text",
    icon: PiWarningCircle,
  },
};

export function RepositoryCard({
  repository,
  onDelete,
  onReindex,
  onSearch,
  onAsk,
  onDoc,
}: RepositoryCardProps) {
  const status = STATUS_CONFIG[repository.status];
  const StatusIcon = status.icon;

  const isIndexing =
    repository.status === RepoStatus.INDEXING || repository.status === RepoStatus.PENDING;
  const isReady = repository.status === RepoStatus.READY;
  const isFailed = repository.status === RepoStatus.FAILED;
  const progress =
    repository.chunkCount > 0
      ? Math.round((repository.embeddedCount / repository.chunkCount) * 100)
      : 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-canvas-border/50 bg-canvas-bg">
            <PiGithubLogo className="size-5 text-canvas-text-contrast" />
          </div>
          <div className="min-w-0">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 truncate text-sm font-medium text-canvas-text-contrast hover:text-primary-text"
            >
              <span className="truncate">
                {repository.owner}/{repository.repo}
              </span>
              <PiArrowSquareOut className="size-3.5 shrink-0 text-canvas-text" />
            </a>
            {repository.defaultBranch && (
              <p className="text-xs text-canvas-text">branch: {repository.defaultBranch}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={status.className}>
            <StatusIcon className={status.spin ? "animate-spin" : undefined} />
            {status.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(repository)}
            aria-label="Remove repository"
          >
            <PiTrash className="text-alert-text" />
          </Button>
        </div>
      </div>

      {isIndexing && (
        <div className="mt-4 space-y-2">
          <Progress value={repository.chunkCount > 0 ? progress : undefined} />
          <p className="text-xs text-canvas-text">
            {repository.chunkCount > 0
              ? `Embedding ${repository.embeddedCount} / ${repository.chunkCount} chunks`
              : "Fetching files…"}
          </p>
        </div>
      )}

      {!isIndexing && (
        <div className="mt-4 flex items-center gap-4 text-xs text-canvas-text">
          <span className="flex items-center gap-1.5">
            <PiStack className="size-4" />
            {repository.chunkCount} {repository.chunkCount === 1 ? "chunk" : "chunks"} indexed
          </span>
          {repository.lastIndexedAt && (
            <span>Indexed {format(new Date(repository.lastIndexedAt), "MMM d, h:mm a")}</span>
          )}
        </div>
      )}

      {isFailed && repository.error && (
        <p className="mt-3 rounded-lg border border-alert-border/50 bg-alert-bg-subtle p-3 text-xs text-alert-text">
          {repository.error}
        </p>
      )}

      {(isReady || isFailed) && (
        <div className="mt-4 flex items-center gap-2">
          {isReady && (
            <Button size="sm" onClick={() => onAsk(repository)}>
              <PiChatCircle />
              Ask
            </Button>
          )}
          {isReady && (
            <Button variant="outline" size="sm" onClick={() => onDoc(repository)}>
              <PiBookOpenText />
              {repository.onboardingGeneratedAt ? "Onboarding doc" : "Generate doc"}
            </Button>
          )}
          {isReady && (
            <Button variant="outline" size="sm" onClick={() => onSearch(repository)}>
              <PiMagnifyingGlass />
              Search code
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onReindex(repository)}>
            <PiArrowsClockwise />
            {isFailed ? "Retry" : "Re-index"}
          </Button>
        </div>
      )}
    </Card>
  );
}
