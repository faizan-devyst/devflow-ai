import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as z from "zod";
import { headers } from "next/headers";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body);

    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
