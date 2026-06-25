import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { searchRepository } from "@/lib/search";
import { aiKeyError, aiRateLimitError } from "@/lib/ai-guards";

const bodySchema = z.object({
  query: z.string().trim().min(2, "Enter a search query").max(2000),
  limit: z.number().int().min(1).max(20).optional(),
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

  const keyError = aiKeyError("openai");
  if (keyError) return keyError;
  const limited = aiRateLimitError(session.user.id, "search", 30);
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

  try {
    const matches = await searchRepository(id, parsed.data.query, parsed.data.limit ?? 8);
    return NextResponse.json({ matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
