import Link from "next/link";
import { PiArrowLeft, PiFileText, PiGithubLogo } from "react-icons/pi";
import { constructMetadata } from "@/lib/metadata";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description: "Terms of service for DevFlow AI — open source developer productivity platform.",
  image: `/api/og?title=Terms of Service&description=Legal&type=page`,
  noIndex: true,
});

export default async function TermsPage() {
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
          <PiFileText className="text-primary-solid mb-4" size={32} />
          <h1 className="text-3xl font-semibold text-canvas-text-contrast mb-2">
            Terms of Service
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
                Acceptance
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              By using DevFlow AI, you agree to these terms. If you do not agree,
              do not use the software.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Open Source License
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              DevFlow AI is released under the MIT License. You are free to use, copy,
              modify, merge, publish, distribute, sublicense, and/or sell copies of the
              software, subject to the conditions of the MIT License included in the repository.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Your API Keys & Data
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              DevFlow AI requires you to provide your own third-party API keys (Anthropic,
              OpenAI, Resend). You are solely responsible for your API usage, associated costs,
              and compliance with those providers&apos; terms of service. Your data is stored in
              your own database. We do not have access to it.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                4
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                No Warranty
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              DevFlow AI is provided as is, without warranty of any kind, express or implied.
              The maintainers make no guarantees regarding uptime, accuracy, or fitness for
              a particular purpose.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                5
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Limitation of Liability
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              The maintainers of DevFlow AI shall not be liable for any direct, indirect,
              incidental, or consequential damages arising from your use of this software.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                6
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Contributions
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              By submitting a pull request or contribution to DevFlow AI, you agree that
              your contribution will be licensed under the same MIT License as the project.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary-bg text-primary-text text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                7
              </span>
              <h2 className="text-canvas-text-contrast font-semibold text-lg">
                Changes to Terms
              </h2>
            </div>
            <p className="text-canvas-text leading-relaxed">
              These terms may be updated from time to time. Continued use of the software
              constitutes acceptance of any changes.
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
              For questions, open an issue on the GitHub repository.
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
