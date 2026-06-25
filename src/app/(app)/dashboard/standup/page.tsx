// CSR — interactive team standup feed (Redux); auth is enforced in the dashboard layout (SSR).
import { constructMetadata } from "@/lib/metadata";
import { StandupPageClient } from "@/components/standup/standup-page-client";

export const metadata = constructMetadata({
  title: "Standup",
  description: "Daily standup for remote dev teams and startups.",
});

export default function StandupPage() {
  return <StandupPageClient />;
}
