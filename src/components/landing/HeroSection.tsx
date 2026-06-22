"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PiSparkle, PiArrowRight } from "react-icons/pi";
import { TextRotate } from "../animations/TextRotate";
import { Button } from "../ui/button";

const ROTATING_WORDS = ["Dev Teams", "Async Standups", "Codebase Onboarding", "Agencies"];

const AVATARS = [
  { initials: "JK", id: "jk" },
  { initials: "AM", id: "am" },
  { initials: "RP", id: "rp" },
  { initials: "SL", id: "sl" },
  { initials: "TW", id: "tw" },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-primary-bg border border-primary-border/50 text-primary-text text-xs px-3 py-1.5 rounded-full">
            <PiSparkle className="text-primary-solid" />
            AI-Powered Dev Team Workspace
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 text-5xl sm:text-6xl font-semibold leading-tight tracking-tight text-canvas-text-contrast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          The AI Workspace for{" "}
          <br className="hidden sm:block" />
          <span className="inline-flex overflow-hidden h-[1.1em] align-bottom">
            <TextRotate
              texts={ROTATING_WORDS}
              rotationInterval={2400}
              staggerDuration={0.025}
              staggerFrom="first"
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              mainClassName="text-primary-solid text-5xl sm:text-6xl font-semibold"
            />
          </span>
        </motion.h1>

        <motion.p
          className="mt-4 text-canvas-text text-lg max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Async standups your team will actually use. Instant codebase onboarding. Weekly digests clients love.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up" className="flex items-center gap-2">
              Start Free
              <PiArrowRight />
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <Link href="#how-it-works" className="flex items-center gap-2">
              Watch Demo
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-6 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className="flex items-center">
            {AVATARS.map((avatar, i) => (
              <div
                key={avatar.id}
                className={`w-8 h-8 rounded-full bg-primary-bg text-primary-text text-xs font-medium flex items-center justify-center border-2 border-canvas-base select-none ${i !== 0 ? "-ml-2" : ""}`}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
          <p className="ml-3 text-canvas-text text-sm">
            <span className="text-canvas-text-contrast font-medium">200+</span> developers trust DevFlow
          </p>
        </motion.div>
      </div>
    </section>
  );
}