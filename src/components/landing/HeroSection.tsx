"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PiSparkle,
  PiArrowRight,
  PiShieldCheck,
  PiKey,
  PiDatabase,
} from "react-icons/pi";
import { TextRotate } from "../animations/TextRotate";
import { Button } from "../ui/button";

const ROTATING_WORDS = [
  "Engineering Teams",
  "Async Standups",
  "Codebase Onboarding",
  "Software Agencies",
];

const TRUST_POINTS = [
  { icon: PiShieldCheck, label: "Secure workspaces" },
  { icon: PiKey, label: "Bring your own API keys" },
  { icon: PiDatabase, label: "Your data stays yours" },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen -mt-16 md:-mt-10 flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-primary-bg border border-primary-border/50 text-primary-text text-xs px-3 py-1.5 rounded-full">
            <PiSparkle className="text-primary-solid" />
            The AI workspace for engineering teams
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 text-5xl sm:text-6xl font-semibold leading-tight tracking-tight text-canvas-text-contrast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Less reporting.
          <br className="hidden sm:block" />
          More shipping, for{" "}
          <span className="inline-flex overflow-hidden h-[1.1em] align-bottom">
            <TextRotate
              texts={ROTATING_WORDS}
              rotationInterval={2400}
              staggerDuration={0.025}
              staggerFrom="first"
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 320,
              }}
              mainClassName="text-primary-solid text-5xl sm:text-6xl font-semibold"
            />
          </span>
        </motion.h1>

        <motion.p
          className="mt-5 text-canvas-text text-lg max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Automate standups, generate team summaries, and onboard engineers
          faster with AI-powered codebase search.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-in" className="flex items-center gap-2">
              Sign in
              <PiArrowRight />
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <Link href="#how-it-works" className="flex items-center gap-2">
              How it works
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-canvas-text text-sm"
            >
              <Icon className="text-primary-text" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}