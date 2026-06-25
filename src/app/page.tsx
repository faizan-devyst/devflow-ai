import HeroSection from "@/components/landing/HeroSection";
import WaveDivider from "@/components/animations/WaveDivider";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FAQAndCTA from "@/components/landing/FAQAndCTA";
import { constructMetadata } from "@/lib/metadata";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// SSR — auth-gated: redirects to /dashboard when a session exists (reads request headers).
export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Home",
  description: "Written async standups with AI summaries and weekly digests, plus a codebase onboarding agent that indexes any GitHub repo for semantic search, grounded Q&A, and automatically generated onboarding guides. Open source, bring your own API keys.",
});

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main>
      <HeroSection />
      <WaveDivider />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQAndCTA />
    </main>
  );
}
