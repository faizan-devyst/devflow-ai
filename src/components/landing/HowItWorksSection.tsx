"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiPencilLine,
  PiSparkle,
  PiEnvelope,
  PiLink,
  PiCode,
  PiChatCircleText,
  PiArrowRight,
} from "react-icons/pi";
import WaveDivider from "@/components/animations/WaveDivider";

type TabId = "standup" | "onboarding";

const STANDUP_STEPS = [
  {
    num: 1,
    icon: <PiPencilLine />,
    title: "Log Your Update",
    desc: "Type what you did, what's next, and any blockers whenever suits you.",
  },
  {
    num: 2,
    icon: <PiSparkle />,
    title: "AI Summarizes It",
    desc: "Claude turns raw notes into a clean, structured standup entry with blockers flagged.",
  },
  {
    num: 3,
    icon: <PiEnvelope />,
    title: "Digest Goes Out",
    desc: "Every Friday, a professional sprint report lands in your team and client's inbox.",
  },
];

const ONBOARDING_STEPS = [
  {
    num: 1,
    icon: <PiLink />,
    title: "Paste Repo URL",
    desc: "Drop in any GitHub repo URL. No OAuth, no app installs, no permissions required.",
  },
  {
    num: 2,
    icon: <PiCode />,
    title: "AI Reads the Code",
    desc: "DevFlow ingests files, maps the architecture, and generates a full onboarding document.",
  },
  {
    num: 3,
    icon: <PiChatCircleText />,
    title: "Chat With the Codebase",
    desc: "Ask questions in plain English. Get answers grounded in your actual code with file references.",
  },
];

function StepCard({ step }: { step: (typeof STANDUP_STEPS)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="relative flex-1 text-center bg-canvas-bg-subtle border border-canvas-border/50 rounded-2xl p-6"
    >
      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-solid text-primary-on-primary text-xs flex items-center justify-center font-medium select-none">
        {step.num}
      </span>

      <div className="w-12 h-12 mx-auto rounded-full bg-primary-bg border border-primary-border/50 flex items-center justify-center text-primary-solid text-xl">
        {step.icon}
      </div>

      <h3 className="text-canvas-text-contrast font-semibold mt-4 text-sm">
        {step.title}
      </h3>
      <p className="text-canvas-text text-xs mt-1 leading-relaxed">{step.desc}</p>
    </motion.div>
  );
}

function StepsRow({ steps }: { steps: typeof STANDUP_STEPS }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-stretch">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>
          <StepCard step={step} />
          {i < steps.length - 1 && (
            <div className="hidden sm:flex items-center justify-center shrink-0 mx-2 text-canvas-border text-2xl">
              <PiArrowRight />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const TABS = [
  { id: "standup" as const, label: "StandupAI" },
  { id: "onboarding" as const, label: "Codebase Onboarding" },
];

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<TabId>("standup");

  return (
    <section id="how-it-works" className="bg-canvas-base">
      <div style={{ transform: "scaleX(-1)" }} className="text-canvas-border/30">
        <WaveDivider />
      </div>

      <div className="py-24 px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-primary-text text-xs tracking-widest uppercase font-medium">How It Works</p>
          <h2 className="text-canvas-text-contrast text-4xl font-semibold mt-2">
            Set up in 5 minutes. Runs on autopilot.
          </h2>
          <p className="text-canvas-text text-lg mt-3">Two workflows. Zero manual reporting.</p>
        </motion.div>

        <div className="mt-14 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-10">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-solid text-primary-on-primary"
                      : "bg-canvas-bg border border-canvas-border/50 text-canvas-text hover:text-canvas-text-contrast hover:border-canvas-border"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.22 }}
            >
              <StepsRow steps={activeTab === "standup" ? STANDUP_STEPS : ONBOARDING_STEPS} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}