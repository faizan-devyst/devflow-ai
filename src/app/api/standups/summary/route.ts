import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeamMembership } from "@/lib/teams";
import { standupAuthorInclude, toDateOnly } from "@/lib/standups";
import { generateDailySummary } from "@/lib/ai";
import { aiKeyError, aiRateLimitError } from "@/lib/ai-guards";

const bodySchema = z.object({
  teamId: z.string().min(1, "teamId is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date as YYYY-MM-DD"),
});

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

  const { teamId, date } = parsed.data;

  const [membership, team] = await Promise.all([
    getTeamMembership(session.user.id, teamId),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);
  if (!membership || !team) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keyError = aiKeyError("anthropic");
  if (keyError) return keyError;
  const limited = aiRateLimitError(session.user.id, "summary", 10);
  if (limited) return limited;

  const standups = await prisma.standup.findMany({
    where: { teamId, date: toDateOnly(date) },
    include: standupAuthorInclude,
    orderBy: { createdAt: "asc" },
  });

  if (standups.length === 0) {
    return NextResponse.json({ error: "No standups for this date yet" }, { status: 400 });
  }

  try {
    const summary = await generateDailySummary(team.name, date, standups);
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
