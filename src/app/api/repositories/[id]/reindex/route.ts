import { NextResponse, after } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { ingestRepository } from "@/lib/ingest";
import { RepoStatus } from "@/generated/prisma/client";

const bodySchema = z.object({
  token: z.string().trim().optional(),
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

  // Body is optional; a token is only needed for private repos
  let token: string | undefined;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (parsed.success) token = parsed.data.token;
  } catch {
    // no body — fine, retry without a token
  }

  const updated = await prisma.repository.update({
    where: { id },
    data: { status: RepoStatus.PENDING, error: null },
  });

  after(() => ingestRepository(id, token));

  return NextResponse.json(updated);
}
