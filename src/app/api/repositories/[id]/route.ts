import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const repository = await prisma.repository.findUnique({ where: { id } });
  if (!repository) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

  // Only members of the owning team may remove it
  const membership = await getTeamMembership(session.user.id, repository.teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.repository.delete({ where: { id } });
  return NextResponse.json({ id });
}
