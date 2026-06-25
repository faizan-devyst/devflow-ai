import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAppOwner } from "@/lib/auth-utils";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Only the global Owner can delete a team.
  if (!isAppOwner(session)) {
    return NextResponse.json({ error: "Only the owner can delete a team" }, { status: 403 });
  }

  // Cascades to members, standups, repositories, code chunks, and invitations
  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ id });
}
