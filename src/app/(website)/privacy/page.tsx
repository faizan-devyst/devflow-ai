import Link from "next/link";
import { PiArrowLeft, PiShieldCheck, PiGithubLogo } from "react-icons/pi";
import { constructMetadata } from "@/lib/metadata";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for DevFlow AI. Your data stays in your own database.",
  image: `/api/og?title=Privacy Policy&description=Legal&type=page`,
  noIndex: true,
});

export default async function PrivacyPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-canvas-base min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-canvas-text hover:text-canvas-text-contrast text-sm transition-colors mb-12"
        >
          <PiArrowLeft />
          Back
        </Link>

        <header className="mb-12">
          <PiShieldCheck className="text-primary-solid mb-4" size={32} />
          <h1 className="text-3xl font-semibold text-canvas-text-contrast mb-2">
            Privacy Policy
          </h1>
          <p className="text-canvas-text text-sm">Last updated: April 2026</p>
        </header>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                What We Collect
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              DevFlow AI collects only what is necessary to operate: account information
              (name, email) via Clerk authentication, standup entries and sprint data you
              create, GitHub repository data you explicitly connect for codebase analysis,
              and usage preferences and settings.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                What We Do Not Collect
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              We do not sell your data. We do not run analytics or ad tracking. We do not
              store your API keys — they live in your environment variables only. We do not
              have access to your self-hosted database.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Third-Party Services
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed mb-4">
              DevFlow AI integrates with the following services. Each has its own privacy
              policy you should review:
            </p>
            <ul className="space-y-2 list-disc list-inside text-canvas-text leading-relaxed">
              <li>
                Clerk (authentication) &rarr;{" "}
                <a
                  href="https://clerk.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  clerk.com/privacy
                </a>
              </li>
              <li>
                Anthropic Claude API &rarr;{" "}
                <a
                  href="https://anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  anthropic.com/privacy
                </a>
              </li>
              <li>
                OpenAI API &rarr;{" "}
                <a
                  href="https://openai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  openai.com/privacy
                </a>
              </li>
              <li>
                Neon (database) &rarr;{" "}
                <a
                  href="https://neon.tech/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  neon.tech/privacy
                </a>
              </li>
              <li>
                Resend (email) &rarr;{" "}
                <a
                  href="https://resend.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  resend.com/privacy
                </a>
              </li>
              <li>
                Vercel (hosting) &rarr;{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-text hover:text-primary-solid underline-offset-2 hover:underline"
                >
                  vercel.com/legal/privacy-policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                4
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Data Storage
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              All application data is stored in the PostgreSQL database you provision and
              control. If you are self-hosting, you have complete control over your data.
              If using a managed deployment, refer to your hosting provider&apos;s privacy policy.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                5
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Authentication
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              Authentication is handled entirely by Clerk. DevFlow AI stores only your
              Clerk user ID as a reference. We do not store passwords.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                6
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                AI Processing
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              When you use AI features, your content (standup entries, code chunks) is sent
              to the Anthropic and OpenAI APIs using your own API keys. Review their privacy
              policies for how they handle API inputs.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                7
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Your Rights
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              You can delete your account and all associated data at any time from
              Settings &rarr; Danger Zone. This permanently removes your data from the database.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                8
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Contact
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              For privacy concerns, open an issue on the GitHub repository.
            </p>
          </section>
        </div>

        <div className="bg-canvas-bg-subtle border border-canvas-border/50 rounded-xl p-6 text-center mt-12 flex flex-col items-center">
          <p className="text-canvas-text-contrast font-medium">Have questions?</p>
          <p className="text-canvas-text text-sm mt-1 mb-4">Open an issue on GitHub</p>
          <a
            href="https://github.com/faizan-devstack/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-solid text-primary-on-primary hover:bg-primary-solid-hover px-4 py-2 rounded-md font-medium text-sm inline-flex items-center gap-2 transition-colors"
          >
            <PiGithubLogo size={18} />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
