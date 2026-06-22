import HeroSection from "@/components/landing/HeroSection";
import WaveDivider from "@/components/animations/WaveDivider";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FAQAndCTA from "@/components/landing/FAQAndCTA";
import { constructMetadata } from "@/lib/metadata";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Home",
  description: "Open source AI productivity platform. Async standups with sprint digests and codebase onboarding powered by Claude. Free forever, bring your own API keys.",
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
