import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAppOwner } from "@/lib/auth-utils";
import { Role } from "@/generated/prisma/client";
import type { TeamWithRole } from "@/types";

const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name must be at least 2 characters").max(50),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: { team: true },
    orderBy: { createdAt: "asc" },
  });

  const teams: TeamWithRole[] = memberships.map(({ team, role }) => ({ ...team, role }));
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only the global Owner can create teams.
  if (!isAppOwner(session)) {
    return NextResponse.json({ error: "Only the owner can create teams" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // The owner joins as a Team Lead so existing membership-guarded queries keep working.
  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      members: { create: { userId: session.user.id, role: Role.TEAM_LEAD } },
    },
  });

  const result: TeamWithRole = { ...team, role: Role.TEAM_LEAD };
  return NextResponse.json(result, { status: 201 });
}
