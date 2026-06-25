import { Prisma } from "@/generated/prisma/client";

/** Shared author projection so list/create/update return the same standup shape. */
export const standupAuthorInclude = {
  user: { select: { id: true, name: true, image: true, email: true } },
} satisfies Prisma.StandupInclude;

/** Parse a YYYY-MM-DD string into a UTC-midnight Date for a date-only column. */
export function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

/** True for a Prisma unique-constraint violation (P2002), without depending on the error class. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
