"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PiSpinner, PiGithubLogo } from "react-icons/pi";

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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectRepository } from "@/store/slices/repositorySlice";

interface ConnectRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function ConnectRepositoryDialog({
  open,
  onOpenChange,
  teamId,
}: ConnectRepositoryDialogProps) {
  const dispatch = useAppDispatch();
  const connecting = useAppSelector((state) => state.repositories.connecting);

  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Enter a repository URL");
      return;
    }
    try {
      const repo = await dispatch(
        connectRepository({ teamId, url: url.trim(), token: token.trim() || undefined })
      ).unwrap();
      toast.success(`Connected ${repo.owner}/${repo.repo}, indexing started`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect repository");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiGithubLogo />
            Connect a repository
          </DialogTitle>
          <DialogDescription>
            Paste a GitHub repository and we'll index its code for onboarding. Indexing runs in the
            background.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository</Label>
            <Input
              id="repo-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="owner/repo or https://github.com/owner/repo"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-token">
              Access token <span className="text-canvas-text">(optional, for private repos)</span>
            </Label>
            <Input
              id="repo-token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="GitHub personal access token"
            />
            <p className="text-xs text-canvas-text">
              The token is used once to fetch the code and is never stored.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={connecting}>
              {connecting && <PiSpinner className="mr-2 size-4 animate-spin" />}
              Connect &amp; index
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
