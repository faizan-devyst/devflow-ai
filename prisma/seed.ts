import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";

// Manually seed the single global Owner. Run with `pnpm db:seed`.
// Requires OWNER_EMAIL and OWNER_PASSWORD (min 8 chars) in the environment.
// Idempotent: re-running updates the role and resets the password.
async function main() {
  const email = process.env.OWNER_EMAIL?.toLowerCase();
  const password = process.env.OWNER_PASSWORD;
  const name = process.env.OWNER_NAME ?? "Owner";

  if (!email || !password) {
    throw new Error("Set OWNER_EMAIL and OWNER_PASSWORD before seeding the owner.");
  }
  if (password.length < 8) {
    throw new Error("OWNER_PASSWORD must be at least 8 characters.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { appRole: "OWNER", emailVerified: true },
    create: { name, email, emailVerified: true, appRole: "OWNER" },
  });

  // Better-Auth stores email/password credentials in an account row with
  // providerId "credential"; the hash uses the same scheme sign-in verifies against.
  const hashed = await hashPassword(password);
  const existing = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: { password: hashed } });
  } else {
    await prisma.account.create({
      data: { userId: user.id, accountId: user.id, providerId: "credential", password: hashed },
    });
  }

  console.info(`Seeded owner: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
