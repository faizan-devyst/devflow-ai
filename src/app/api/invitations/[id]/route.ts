import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/teams";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/auth-utils";

// Revoke a pending invitation.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (!(await canManageTeam(session, invitation.teamId))) return forbiddenResponse();

  await prisma.invitation.update({ where: { id }, data: { status: "REVOKED" } });
  return NextResponse.json({ id });
}
