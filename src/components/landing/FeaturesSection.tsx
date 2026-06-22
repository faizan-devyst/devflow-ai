"use client";

import { motion } from "framer-motion";
import {
  PiCheck,
  PiGithubLogo,
  PiChatCircleText,
  PiUsers,
  PiArrowRight,
  PiWarning,
  PiRobot,
} from "react-icons/pi";

function MockStandupCard() {
  return (
    <div className="bg-canvas-bg rounded-2xl p-5 border border-canvas-border/50 space-y-4 select-none">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-bg border border-primary-border/50 text-primary-text text-xs font-semibold flex items-center justify-center shrink-0">
          AK
        </div>
        <div>
          <p className="text-canvas-text-contrast text-sm font-semibold">Alex K.</p>
          <p className="text-canvas-text text-xs mt-0.5">Today&apos;s Standup</p>
        </div>
        <span className="ml-auto text-canvas-text text-xs bg-canvas-bg-subtle border border-canvas-border/50 px-2 py-0.5 rounded-full">
          9:14 am
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-success-text text-xs font-medium">
          <PiCheck />
          Done
        </div>
        <p className="text-canvas-text text-xs pl-4 leading-relaxed">Fixed auth bug in the middleware layer</p>
        <p className="text-canvas-text text-xs pl-4 leading-relaxed">Reviewed 3 open PRs</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-info-text text-xs font-medium">
          <PiArrowRight />
          Next
        </div>
        <p className="text-canvas-text text-xs pl-4 leading-relaxed">Start onboarding flow UI</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-warning-text text-xs font-medium">
          <PiWarning />
          Blockers
        </div>
        <p className="text-canvas-text text-xs pl-4 leading-relaxed">Waiting on API keys from client</p>
      </div>

      <div className="pt-1 border-t border-canvas-border/50">
        <div className="inline-flex items-center gap-1.5 bg-success-bg border border-success-border/50 text-success-text text-xs px-3 py-1.5 rounded-full">
          <PiRobot />
          AI Summary Ready
        </div>
      </div>
    </div>
  );
}

function SmallCard({
  tagLabel,
  tagClass,
  icon,
  title,
  desc,
}: {
  tagLabel: string;
  tagClass: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true }}
      className="bg-canvas-base border border-canvas-border/50 rounded-2xl p-6 flex flex-col"
    >
      <span className={`self-start text-xs px-3 py-1 rounded-full border ${tagClass}`}>
        {tagLabel}
      </span>
      <div className="mt-4 text-2xl">{icon}</div>
      <h3 className="text-canvas-text-contrast font-semibold mt-3 text-sm leading-snug">
        {title}
      </h3>
      <p className="text-canvas-text text-sm mt-1 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="pt-8 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-primary-text text-xs tracking-widest uppercase font-medium">Features</p>
          <h2 className="text-canvas-text-contrast text-4xl font-semibold mt-2">
            Two tools. One focused workspace.
          </h2>
          <p className="text-canvas-text text-lg mt-3 max-w-xl mx-auto">
            Everything a small dev team or agency needs, nothing they don&apos;t.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 bg-canvas-base border border-canvas-border/50 rounded-3xl p-8 mb-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-primary-bg text-primary-text border border-primary-border/50">
                StandupAI
              </span>
              <h3 className="text-canvas-text-contrast text-2xl font-semibold mt-3">
                Async standups that actually work
              </h3>
              <p className="text-canvas-text text-sm mt-2 leading-relaxed max-w-md">
                No more 9am calls. Team members log anytime, AI summarizes instantly, clients get weekly digests automatically.
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {[
                  "AI-structured standup summaries",
                  "Blocker detection and flagging",
                  "Auto weekly sprint digest email",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <PiCheck className="text-success-solid" />
                    <span className="text-canvas-text text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <MockStandupCard />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SmallCard
            tagLabel="Onboarding Agent"
            tagClass="bg-secondary-bg text-secondary-text border-secondary-border/50"
            icon={<PiGithubLogo className="text-secondary-solid" />}
            title="Paste a repo. Get full docs."
            desc="AI reads your codebase and generates an onboarding doc in minutes."
          />
          <SmallCard
            tagLabel="AI Q&A"
            tagClass="bg-primary-bg text-primary-text border-primary-border/50"
            icon={<PiChatCircleText className="text-primary-solid" />}
            title="Ask anything about the code"
            desc="New devs get answers grounded in your actual codebase — not Stack Overflow."
          />
          <SmallCard
            tagLabel="Collaboration"
            tagClass="bg-secondary-bg text-secondary-text border-secondary-border/50"
            icon={<PiUsers className="text-secondary-solid" />}
            title="Built for teams and clients"
            desc="Invite your team, share digests with clients. Role access included."
          />
        </div>
      </div>
    </section>
  );
}