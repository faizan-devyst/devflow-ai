import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { standupAuthorInclude, toDateOnly, isUniqueViolation } from "@/lib/standups";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const createStandupSchema = z.object({
  teamId: z.string().min(1, "teamId is required"),
  date: z.string().regex(DATE_RE, "Expected date as YYYY-MM-DD"),
  yesterday: z.string().trim().min(1, "Yesterday is required"),
  today: z.string().trim().min(1, "Today is required"),
  blockers: z.string().trim().optional(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const date = searchParams.get("date");

  if (!teamId) return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  if (date && !DATE_RE.test(date))
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  // Authorize: caller must belong to the team before seeing its standups
  const membership = await getTeamMembership(session.user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const standups = await prisma.standup.findMany({
    where: { teamId, ...(date ? { date: toDateOnly(date) } : {}) },
    include: standupAuthorInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(standups);
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

  const parsed = createStandupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { teamId, date, yesterday, today, blockers } = parsed.data;

  const membership = await getTeamMembership(session.user.id, teamId);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const standup = await prisma.standup.create({
      data: {
        teamId,
        userId: session.user.id,
        date: toDateOnly(date),
        yesterday,
        today,
        blockers: blockers || null,
      },
      include: standupAuthorInclude,
    });
    return NextResponse.json(standup, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "You already submitted a standup for this date" },
        { status: 409 }
      );
    }
    throw error;
  }
}
