"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PiMagnifyingGlass, PiSpinner } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import type { CodeChunkMatch } from "@/types";

interface RepoSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryId: string;
  repositoryName: string;
}

export function RepoSearchDialog({
  open,
  onOpenChange,
  repositoryId,
  repositoryName,
}: RepoSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CodeChunkMatch[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      toast.error("Enter a search query");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ matches: CodeChunkMatch[] }>(
        `/api/repositories/${repositoryId}/search`,
        { method: "POST", body: JSON.stringify({ query: query.trim() }) }
      );
      setResults(data.matches);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiMagnifyingGlass className="text-primary-text" />
            Search {repositoryName}
          </DialogTitle>
          <DialogDescription>
            Semantic search over the indexed code. Describe what you're looking for in plain English.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. where are auth sessions validated?"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? <PiSpinner className="size-4 animate-spin" /> : <PiMagnifyingGlass />}
            Search
          </Button>
        </form>

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {results && results.length === 0 && (
            <p className="py-6 text-center text-sm text-canvas-text">No matching code found.</p>
          )}
          {results?.map((match) => (
            <div
              key={match.id}
              className="overflow-hidden rounded-lg border border-canvas-border/50 bg-canvas-bg-subtle"
            >
              <div className="flex items-center justify-between gap-2 border-b border-canvas-border/50 px-3 py-2">
                <span className="truncate font-mono text-xs text-canvas-text-contrast">
                  {match.path}:{match.startLine}-{match.endLine}
                </span>
                <span className="shrink-0 text-xs text-primary-text">
                  {Math.round(match.similarity * 100)}% match
                </span>
              </div>
              <pre className="max-h-48 overflow-auto px-3 py-2 text-xs text-canvas-text-contrast">
                <code>{match.content}</code>
              </pre>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
