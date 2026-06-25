"use client";

import { motion } from "framer-motion";
import {
  PiCheck,
  PiGithubLogo,
  PiChatCircleText,
  PiMagnifyingGlass,
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
            Two workflows. One focused workspace.
          </h2>
          <p className="text-canvas-text text-lg mt-3 max-w-xl mx-auto">
            Keep the team in sync and get new engineers productive, without the meetings or the wiki archaeology.
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
                Standups without the meeting
              </h3>
              <p className="text-canvas-text text-sm mt-2 leading-relaxed max-w-md">
                Everyone posts what they did, what&apos;s next, and any blockers, in writing, on their own time. Claude turns the day into a clear summary, and a weekly sprint digest is one click away.
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {[
                  "AI daily summaries that group work and surface blockers",
                  "One click weekly sprint digest, emailed to the whole team",
                  "Filter by teammate or date, scoped to each workspace",
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
            tagClass="bg-primary-bg text-primary-text border-primary-border/50"
            icon={<PiGithubLogo className="text-primary-solid" />}
            title="Connect a repo, get a guide"
            desc="DevFlow indexes your codebase and writes an onboarding guide: overview, architecture, key modules, and where to start."
          />
          <SmallCard
            tagLabel="Grounded Q&A"
            tagClass="bg-primary-bg text-primary-text border-primary-border/50"
            icon={<PiChatCircleText className="text-primary-solid" />}
            title="Ask the codebase anything"
            desc="Answers are grounded in your real code and cite the exact files and line ranges they came from."
          />
          <SmallCard
            tagLabel="Semantic search"
            tagClass="bg-info-bg text-info-text border-info-border/50"
            icon={<PiMagnifyingGlass className="text-info-solid" />}
            title="Find code by describing it"
            desc="Vector search over your repo surfaces the most relevant files for a plain English query."
          />
        </div>
      </div>
    </section>
  );
}