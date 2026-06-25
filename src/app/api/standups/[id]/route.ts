import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { standupAuthorInclude } from "@/lib/standups";

const updateStandupSchema = z
  .object({
    yesterday: z.string().trim().min(1, "Yesterday is required").optional(),
    today: z.string().trim().min(1, "Today is required").optional(),
    blockers: z.string().trim().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.standup.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Standup not found" }, { status: 404 });
  // Only the author may edit their standup
  if (existing.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateStandupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { yesterday, today, blockers } = parsed.data;

  const standup = await prisma.standup.update({
    where: { id },
    data: {
      ...(yesterday !== undefined ? { yesterday } : {}),
      ...(today !== undefined ? { today } : {}),
      ...(blockers !== undefined ? { blockers: blockers || null } : {}),
    },
    include: standupAuthorInclude,
  });

  return NextResponse.json(standup);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.standup.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Standup not found" }, { status: 404 });
  if (existing.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.standup.delete({ where: { id } });
  return NextResponse.json({ id });
}
