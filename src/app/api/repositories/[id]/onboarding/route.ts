import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { gatherRepoContext } from "@/lib/onboarding";
import { generateOnboardingDoc } from "@/lib/ai";
import { aiKeyError, aiRateLimitError } from "@/lib/ai-guards";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const repository = await prisma.repository.findUnique({ where: { id } });
  if (!repository) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

  const membership = await getTeamMembership(session.user.id, repository.teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keyError = aiKeyError("anthropic");
  if (keyError) return keyError;
  const limited = aiRateLimitError(session.user.id, "onboarding", 5);
  if (limited) return limited;

  const context = await gatherRepoContext(id);
  if (context.paths.length === 0) {
    return NextResponse.json(
      { error: "This repository has no indexed code yet — index it first" },
      { status: 400 }
    );
  }

  try {
    const doc = await generateOnboardingDoc({
      repoName: `${repository.owner}/${repository.repo}`,
      paths: context.paths,
      totalFiles: context.totalFiles,
      excerpts: context.excerpts,
    });

    const updated = await prisma.repository.update({
      where: { id },
      data: { onboardingDoc: doc, onboardingGeneratedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate onboarding doc";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
