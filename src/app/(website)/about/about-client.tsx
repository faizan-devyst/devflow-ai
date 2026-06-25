"use client";

import { motion } from "framer-motion";
import {
  PiSparkle,
  PiMicrophone,
  PiCode,
  PiX,
  PiGithubLogo,
} from "react-icons/pi";

export default function AboutClient() {
  const pageEntry = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  };

  const stackItems = [
    "Next.js 16",
    "TypeScript",
    "Tailwind CSS",
    "Prisma ORM",
    "NeonDB",
    "pgvector",
    "Better Auth",
    "Claude API",
    "OpenAI Embeddings",
    "Vercel",
  ];

  return (
    <div className="bg-canvas-base min-h-screen">
      <section className="bg-canvas-base py-20 text-center">
        <motion.div
          className="max-w-4xl mx-auto px-6"
          initial={pageEntry.initial}
          animate={pageEntry.animate}
          transition={pageEntry.transition}
        >
          <div className="bg-primary-bg text-primary-text text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-6">
            <PiSparkle />
            Open Source
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-canvas-text-contrast">
            Built for developers,{" "}
            <span className="text-primary-solid block mt-2">by developers.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-canvas-text text-lg leading-relaxed mt-6">
            DevFlow AI began as an answer to two problems every engineering team knows well:
            status meetings that interrupt deep work, and the slow, painful ramp-up of joining
            an unfamiliar codebase. It pairs written async standups with an AI agent that turns
            any repository into something you can search and ask questions about. It is open
            source, so you can run it on your own stack and keep your data your own.
          </p>
        </motion.div>
      </section>

      <section className="bg-canvas-bg-subtle py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-canvas-text-contrast font-semibold text-2xl text-center mb-10">
            What it does
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              className="bg-canvas-base border border-canvas-border/50 rounded-xl p-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary-bg flex items-center justify-center">
                <PiMicrophone className="text-primary-solid" size={20} />
              </div>
              <h3 className="text-canvas-text-contrast font-semibold mt-4">
                StandupAI
              </h3>
              <p className="text-canvas-text text-sm leading-relaxed mt-2">
                Written async standups, scoped to each team. Claude generates a clear daily
                summary that surfaces blockers, and a weekly sprint digest goes out to the
                whole team with one click. No recurring meeting required.
              </p>
            </motion.div>

            <motion.div
              className="bg-canvas-base border border-canvas-border/50 rounded-xl p-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary-bg flex items-center justify-center">
                <PiCode className="text-primary-solid" size={20} />
              </div>
              <h3 className="text-canvas-text-contrast font-semibold mt-4">
                Codebase Onboarding Agent
              </h3>
              <p className="text-canvas-text text-sm leading-relaxed mt-2">
                Connect a GitHub repo and DevFlow indexes the code into a private vector
                index. From there you get semantic search, a Q&A chat whose answers cite the
                exact files and lines, and an automatically generated onboarding guide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-canvas-base py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-canvas-text-contrast font-semibold text-2xl text-center mb-10">
            What it is not
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-6">
              <PiX className="text-alert-text mx-auto mb-3" size={20} />
              <p className="text-canvas-text text-sm">
                A VC backed SaaS trying to lock you in
              </p>
            </div>
            <div className="text-center p-6">
              <PiX className="text-alert-text mx-auto mb-3" size={20} />
              <p className="text-canvas-text text-sm">
                A product that trains on your data
              </p>
            </div>
            <div className="text-center p-6">
              <PiX className="text-alert-text mx-auto mb-3" size={20} />
              <p className="text-canvas-text text-sm">
                Something you need to pay for
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-canvas-bg-subtle py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-canvas-text-contrast font-semibold text-2xl text-center mb-8">
            The stack
          </h2>
          <p className="text-canvas-text text-center mb-8">
            Everything you&apos;d use to build a production app in 2026.
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {stackItems.map((item) => (
              <motion.div
                key={item}
                className="bg-canvas-bg border border-canvas-border/50 rounded-full px-4 py-1.5 text-sm text-canvas-text"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.15 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas-base py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-xl mx-auto bg-primary-bg border border-primary-border/50 rounded-2xl p-10 text-center">
            <PiGithubLogo className="text-primary-solid mx-auto mb-4" size={40} />
            
            <h2 className="text-canvas-text-contrast font-semibold text-2xl">
              Contribute or host it yourself
            </h2>

            <p className="text-canvas-text text-sm leading-relaxed mt-3 mb-6">
              Clone it, fork it, and build on top of it. Star the repo if it helps your team.
            </p>

            <a
              href="https://github.com/faizan-devyst/devflow-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-solid text-primary-on-primary hover:bg-primary-solid-hover px-6 py-2.5 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <PiGithubLogo size={18} />
              View on GitHub
            </a>

            <p className="text-canvas-text text-xs mt-4">
              Built with Next.js &middot; Deployed on Vercel
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
