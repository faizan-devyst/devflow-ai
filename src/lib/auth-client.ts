import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// Type-only import: keeps the server auth instance out of the client bundle while
// letting the client infer custom user fields (appRole) onto the session type.
import type { auth } from "@/lib/auth";

// `signUp` is intentionally not exported — account creation is invite-only and
// happens server-side in the invitation accept route, never from the client.
export const {
  signIn,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});