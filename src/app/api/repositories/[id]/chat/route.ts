import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { searchRepository } from "@/lib/search";
import { streamCodebaseAnswer, type ChatExcerpt } from "@/lib/ai";
import { aiKeyError, aiRateLimitError } from "@/lib/ai-guards";
import type { ChatSource } from "@/types";

const bodySchema = z.object({
  question: z.string().trim().min(2, "Enter a question").max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })
    )
    .max(10)
    .optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const repository = await prisma.repository.findUnique({ where: { id } });
  if (!repository) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

  const membership = await getTeamMembership(session.user.id, repository.teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Chat needs OpenAI (retrieval embeds the query) and Anthropic (the answer)
  const openaiError = aiKeyError("openai");
  if (openaiError) return openaiError;
  const anthropicError = aiKeyError("anthropic");
  if (anthropicError) return anthropicError;
  const limited = aiRateLimitError(session.user.id, "chat", 20);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { question, history = [] } = parsed.data;

  let body_stream: ReadableStream<Uint8Array>;
  let sourcesHeader: string;
  try {
    const matches = await searchRepository(id, question, 8);
    if (matches.length === 0) {
      return NextResponse.json(
        { error: "This repository has no indexed code yet — index it first" },
        { status: 400 }
      );
    }

    const excerpts: ChatExcerpt[] = matches.map((match, index) => ({
      n: index + 1,
      path: match.path,
      startLine: match.startLine,
      endLine: match.endLine,
      content: match.content,
    }));
    const sources: ChatSource[] = matches.map((match, index) => ({
      n: index + 1,
      path: match.path,
      startLine: match.startLine,
      endLine: match.endLine,
      similarity: match.similarity,
    }));
    sourcesHeader = Buffer.from(JSON.stringify(sources)).toString("base64");

    const aiStream = streamCodebaseAnswer({
      repoName: `${repository.owner}/${repository.repo}`,
      question,
      history,
      excerpts,
    });

    const encoder = new TextEncoder();
    body_stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of aiStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to answer";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return new Response(body_stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-sources": sourcesHeader,
    },
  });
}
