import { constructMetadata } from "@/lib/metadata";
import { AcceptInviteCard } from "@/components/auth/accept-invite-card";

// SSR — public invitation accept page; the token in the path is the secret.
export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Accept Invitation",
  description: "Join your team on DevFlow AI.",
});

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <AcceptInviteCard token={token} />
    </div>
  );
}
