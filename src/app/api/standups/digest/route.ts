import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { standupAuthorInclude, toDateOnly } from "@/lib/standups";
import { generateWeeklyDigest } from "@/lib/ai";
import { sendSprintDigestEmail } from "@/lib/email";
import { aiKeyError, aiRateLimitError } from "@/lib/ai-guards";

const bodySchema = z.object({
  teamId: z.string().min(1, "teamId is required"),
});

const WEEK_SPAN_DAYS = 6; // today + the previous 6 days = a 7-day window

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { teamId } = parsed.data;

  const [membership, team] = await Promise.all([
    getTeamMembership(session.user.id, teamId),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);
  if (!membership || !team) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keyError = aiKeyError("anthropic");
  if (keyError) return keyError;
  // Lower limit — each digest emails the whole team
  const limited = aiRateLimitError(session.user.id, "digest", 3);
  if (limited) return limited;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - WEEK_SPAN_DAYS);
  const startYmd = ymd(startDate);
  const endYmd = ymd(now);
  const rangeLabel = `${startYmd} to ${endYmd}`;

  const standups = await prisma.standup.findMany({
    where: { teamId, date: { gte: toDateOnly(startYmd), lte: toDateOnly(endYmd) } },
    include: standupAuthorInclude,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  if (standups.length === 0) {
    return NextResponse.json(
      { error: "No standups in the last 7 days to digest" },
      { status: 400 }
    );
  }

  let digest: string;
  try {
    digest = await generateWeeklyDigest(team.name, rangeLabel, standups);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate digest";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Email every team member; don't fail the whole request if one send errors
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { email: true } } },
  });

  const results = await Promise.allSettled(
    members.map((member) =>
      sendSprintDigestEmail(member.user.email, {
        teamName: team.name,
        periodLabel: rangeLabel,
        digest,
      })
    )
  );
  const emailedTo = results.filter((result) => result.status === "fulfilled").length;

  return NextResponse.json({ digest, emailedTo });
}
