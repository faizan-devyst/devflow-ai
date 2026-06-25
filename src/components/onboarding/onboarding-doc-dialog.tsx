"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PiBookOpenText, PiSpinner, PiArrowsClockwise } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/store/hooks";
import { generateOnboarding } from "@/store/slices/repositorySlice";
import { renderMarkdown } from "@/lib/markdown";
import type { Repository } from "@/types";

interface OnboardingDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository;
}

export function OnboardingDocDialog({ open, onOpenChange, repository }: OnboardingDocDialogProps) {
  const dispatch = useAppDispatch();
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      await dispatch(generateOnboarding(repository.id)).unwrap();
      toast.success("Onboarding doc generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate onboarding doc");
    } finally {
      setGenerating(false);
    }
  };

  const hasDoc = Boolean(repository.onboardingDoc);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiBookOpenText className="text-primary-text" />
            Onboarding · {repository.owner}/{repository.repo}
          </DialogTitle>
          <DialogDescription>
            {hasDoc
              ? repository.onboardingGeneratedAt
                ? `Generated ${format(new Date(repository.onboardingGeneratedAt), "MMM d, h:mm a")}`
                : "Generated from the indexed codebase."
              : "Generate a guide from the indexed code: overview, architecture, key modules, and where to start."}
          </DialogDescription>
        </DialogHeader>

        {hasDoc ? (
          <>
            <div
              className="flex-1 overflow-y-auto pr-1 text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(repository.onboardingDoc ?? "") }}
            />
            <div className="border-t border-canvas-border/50 pt-3">
              <Button variant="outline" size="sm" onClick={generate} disabled={generating}>
                {generating ? (
                  <PiSpinner className="size-4 animate-spin" />
                ) : (
                  <PiArrowsClockwise />
                )}
                Regenerate
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <PiBookOpenText className="size-8 text-canvas-text" />
            <p className="max-w-sm text-sm text-canvas-text">
              No onboarding doc yet. Generate one from the indexed code.
            </p>
            <Button onClick={generate} disabled={generating}>
              {generating ? <PiSpinner className="mr-2 size-4 animate-spin" /> : <PiBookOpenText />}
              Generate onboarding doc
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
