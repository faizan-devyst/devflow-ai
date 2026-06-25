import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";
import { sendUserVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

// Designated single Owner. Their account is the only email allowed to be created
// without an invitation (manual seeding); everyone else joins via an invite link.
const OWNER_EMAIL = process.env.OWNER_EMAIL?.toLowerCase();

// A pending, unexpired invitation for this email — the gate for invite-only signup.
function findLiveInvitations(email: string) {
  return prisma.invitation.findMany({
    where: { email: email.toLowerCase(), status: "PENDING", expiresAt: { gt: new Date() } },
  });
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      // Surfaced on session.user so the client can gate UI by global role.
      appRole: { type: "string", input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendUserVerificationEmail(user.email, url);
    },
    // All accounts are pre-verified by the databaseHook (invite proves ownership);
    // sending a verification email on sign-up would be redundant and confusing.
    sendOnSignUp: false,
  },
  databaseHooks: {
    user: {
      create: {
        // Invite-only gate: block account creation unless this is the seeded Owner
        // or the email has a live invitation. This closes the public sign-up API.
        // For allowed users we pre-verify the email (the invite link / manual seed
        // already proves ownership) so `sendOnSignUp` skips a redundant email.
        before: async (user) => {
          const email = user.email.toLowerCase();
          if (OWNER_EMAIL && email === OWNER_EMAIL) {
            return { data: { ...user, emailVerified: true } };
          }
          const invites = await findLiveInvitations(email);
          if (invites.length === 0) {
            throw new APIError("FORBIDDEN", {
              message: "Sign-up is invite-only. Ask your team owner or lead for an invitation.",
            });
          }
          return { data: { ...user, emailVerified: true } };
        },
        // Wire up the new user: invitees are added to every team they were invited
        // to and those invitations are marked accepted.
        after: async (user) => {
          const email = user.email.toLowerCase();
          const invites = await findLiveInvitations(email);
          if (invites.length === 0) return;
          await prisma.$transaction([
            prisma.teamMember.createMany({
              data: invites.map((invite) => ({
                teamId: invite.teamId,
                userId: user.id,
                role: invite.role,
              })),
              skipDuplicates: true,
            }),
            prisma.invitation.updateMany({
              where: { id: { in: invites.map((invite) => invite.id) } },
              data: { status: "ACCEPTED", acceptedAt: new Date() },
            }),
          ]);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
