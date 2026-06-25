"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { PiPaperPlaneRight, PiSpinner, PiChatCircle, PiUserCircle, PiRobot } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiStream } from "@/lib/api";
import type { ChatSource } from "@/types";

interface RepoChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryId: string;
  repositoryName: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

export function RepoChatDialog({
  open,
  onOpenChange,
  repositoryId,
  repositoryName,
}: RepoChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const nextId = useRef(0);

  const updateLast = (updater: (message: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[copy.length - 1] = updater(copy[copy.length - 1]);
      return copy;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (question.length < 2 || streaming) return;

    const history = messages.map((message) => ({ role: message.role, content: message.content }));
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", content: question },
      { id: nextId.current++, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    try {
      const res = await apiStream(`/api/repositories/${repositoryId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question, history }),
      });

      const sourcesHeader = res.headers.get("x-sources");
      if (sourcesHeader) {
        const sources = JSON.parse(atob(sourcesHeader)) as ChatSource[];
        updateLast((message) => ({ ...message, sources }));
      }

      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let accumulated = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          updateLast((message) => ({ ...message, content: accumulated }));
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chat failed");
      updateLast((message) => ({
        ...message,
        content: message.content || "Sorry, something went wrong.",
      }));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiChatCircle className="text-primary-text" />
            Ask {repositoryName}
          </DialogTitle>
          <DialogDescription>
            Ask anything about this codebase. Answers are grounded in the indexed code and cite their
            sources.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-48 flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-canvas-text">
              e.g. "How does authentication work?" or "Where are API routes defined?"
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  {message.role === "user" ? (
                    <PiUserCircle className="size-5 text-canvas-text" />
                  ) : (
                    <PiRobot className="size-5 text-primary-text" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm whitespace-pre-wrap text-canvas-text-contrast">
                    {message.content || (
                      <span className="text-canvas-text">
                        <PiSpinner className="inline size-4 animate-spin" /> Thinking…
                      </span>
                    )}
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 space-y-1 border-l-2 border-canvas-border/50 pl-3">
                      <p className="text-xs font-medium text-canvas-text">Sources</p>
                      {message.sources.map((source) => (
                        <p key={source.n} className="font-mono text-xs text-canvas-text">
                          [{source.n}] {source.path}:{source.startLine}-{source.endLine}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-canvas-border/50 pt-4">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about this codebase…"
            disabled={streaming}
            autoFocus
          />
          <Button type="submit" disabled={streaming || input.trim().length < 2}>
            {streaming ? (
              <PiSpinner className="size-4 animate-spin" />
            ) : (
              <PiPaperPlaneRight className="size-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
