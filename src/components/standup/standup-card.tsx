"use client";

import { format } from "date-fns";
import { PiPencilSimple, PiTrash, PiWarningCircle } from "react-icons/pi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StandupWithAuthor } from "@/types";

interface StandupCardProps {
  standup: StandupWithAuthor;
  canManage: boolean;
  onEdit: (standup: StandupWithAuthor) => void;
  onDelete: (standup: StandupWithAuthor) => void;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-canvas-text uppercase">{label}</p>
      <p className="text-sm whitespace-pre-wrap text-canvas-text-contrast">{children}</p>
    </div>
  );
}

export function StandupCard({ standup, canManage, onEdit, onDelete }: StandupCardProps) {
  const author = standup.user.name || standup.user.email;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-canvas-border/50 bg-primary-bg-subtle text-xs font-semibold text-primary-text">
            {initialsOf(author)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-canvas-text-contrast">{author}</p>
            <p className="text-xs text-canvas-text">
              {format(new Date(standup.date), "EEE, MMM d, yyyy")}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(standup)}
              aria-label="Edit standup"
            >
              <PiPencilSimple />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(standup)}
              aria-label="Delete standup"
            >
              <PiTrash className="text-alert-text" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Section label="Yesterday">{standup.yesterday}</Section>
        <Section label="Today">{standup.today}</Section>
      </div>

      {standup.blockers && (
        <div className="mt-4 flex gap-2 rounded-lg border border-warning-border/50 bg-warning-bg-subtle p-3">
          <PiWarningCircle className="mt-0.5 size-4 shrink-0 text-warning-text" />
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-warning-text uppercase">Blockers</p>
            <p className="text-sm whitespace-pre-wrap text-canvas-text-contrast">{standup.blockers}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
