// CSR — interactive repository onboarding (Redux); auth is enforced in the dashboard layout (SSR).
import { constructMetadata } from "@/lib/metadata";
import { OnboardingPageClient } from "@/components/onboarding/onboarding-page-client";

export const metadata = constructMetadata({
  title: "Onboarding",
  description: "Onboarding for new joiners in dev teams",
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
