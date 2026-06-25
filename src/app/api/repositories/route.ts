import { NextResponse, after } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { isUniqueViolation } from "@/lib/standups";
import { parseRepoInput } from "@/lib/github";
import { ingestRepository } from "@/lib/ingest";
import { RepoStatus } from "@/generated/prisma/client";
import { aiRateLimitError } from "@/lib/ai-guards";

const connectSchema = z.object({
  teamId: z.string().min(1, "teamId is required"),
  url: z.string().trim().min(1, "Repository URL is required"),
  token: z.string().trim().optional(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = new URL(request.url).searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId is required" }, { status: 400 });

  const membership = await getTeamMembership(session.user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const repositories = await prisma.repository.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(repositories);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { teamId, url, token } = parsed.data;

  const membership = await getTeamMembership(session.user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Connecting + indexing works without OpenAI; embeddings are skipped when the key
  // is absent, and search/chat surface their own 503 when they actually need it.
  const limited = aiRateLimitError(session.user.id, "connect", 10);
  if (limited) return limited;

  const parsedRepo = parseRepoInput(url);
  if (!parsedRepo) {
    return NextResponse.json(
      { error: "Could not parse that as a GitHub repository (use owner/repo or a github.com URL)" },
      { status: 400 }
    );
  }

  const { owner, repo } = parsedRepo;

  let repository;
  try {
    repository = await prisma.repository.create({
      data: {
        teamId,
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
        status: RepoStatus.PENDING,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "That repository is already connected to this team" },
        { status: 409 }
      );
    }
    throw error;
  }

  // Ingest after the response is sent; status flips to READY/FAILED in the DB.
  after(() => ingestRepository(repository.id, token));

  return NextResponse.json(repository, { status: 201 });
}
