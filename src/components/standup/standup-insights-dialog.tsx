"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PiSparkle, PiEnvelope, PiSpinner } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";

interface StandupInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  defaultDate: string;
}

function ResultPanel({ content }: { content: string }) {
  return (
    <div className="max-h-72 overflow-y-auto rounded-lg border border-canvas-border/50 bg-canvas-bg-subtle p-4">
      <p className="text-sm whitespace-pre-wrap text-canvas-text-contrast">{content}</p>
    </div>
  );
}

export function StandupInsightsDialog({
  open,
  onOpenChange,
  teamId,
  defaultDate,
}: StandupInsightsDialogProps) {
  const [date, setDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [digest, setDigest] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const result = await apiFetch<{ summary: string }>("/api/standups/summary", {
        method: "POST",
        body: JSON.stringify({ teamId, date }),
      });
      setSummary(result.summary);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateDigest = async () => {
    setDigestLoading(true);
    try {
      const result = await apiFetch<{ digest: string; emailedTo: number }>(
        "/api/standups/digest",
        { method: "POST", body: JSON.stringify({ teamId }) }
      );
      setDigest(result.digest);
      toast.success(
        `Digest emailed to ${result.emailedTo} ${result.emailedTo === 1 ? "teammate" : "teammates"}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate digest");
    } finally {
      setDigestLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiSparkle className="text-primary-text" />
            AI insights
          </DialogTitle>
          <DialogDescription>
            Generate a daily summary or a weekly sprint digest from your team's standups, powered by
            Claude.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily summary</TabsTrigger>
            <TabsTrigger value="weekly">Weekly digest</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="summary-date">Date</Label>
                <Input
                  id="summary-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-auto"
                />
              </div>
              <Button onClick={generateSummary} disabled={summaryLoading}>
                {summaryLoading ? <PiSpinner className="mr-2 size-4 animate-spin" /> : <PiSparkle />}
                Generate summary
              </Button>
            </div>
            {summary && <ResultPanel content={summary} />}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 pt-4">
            <p className="text-sm text-canvas-text">
              Generates a digest of the last 7 days and emails it to everyone on the team.
            </p>
            <Button onClick={generateDigest} disabled={digestLoading}>
              {digestLoading ? <PiSpinner className="mr-2 size-4 animate-spin" /> : <PiEnvelope />}
              Generate &amp; email digest
            </Button>
            {digest && <ResultPanel content={digest} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
