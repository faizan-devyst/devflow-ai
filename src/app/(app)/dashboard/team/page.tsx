// CSR — interactive team & member management (Redux); auth is enforced in the dashboard layout (SSR).
import { constructMetadata } from "@/lib/metadata";
import { TeamPageClient } from "@/components/team/team-page-client";

export const metadata = constructMetadata({
  title: "Team",
  description: "Manage your team members and invitations.",
});

export default function TeamPage() {
  return <TeamPageClient />;
}
