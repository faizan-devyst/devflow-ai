"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { PiCaretDown, PiRocketLaunch } from "react-icons/pi";
import Link from "next/link";
import WaveDivider from "@/components/animations/WaveDivider";
import { Button } from "@/components/ui/button";
import { GithubStars } from "@/components/landing/github-stars";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    q: "Is DevFlow AI free to use?",
    a: "Yes, completely. DevFlow AI is open source and free forever. You only need your own API keys (Anthropic/OpenAI) to power the AI features.",
  },
  {
    id: "faq-2",
    q: "Do I need to provide my own API keys?",
    a: "Yes. DevFlow AI uses the Claude API for summaries, digests, codebase answers, and onboarding docs, and OpenAI for code embeddings. You bring your own keys, so your data stays private and you keep full control over usage and cost.",
  },
  {
    id: "faq-3",
    q: "Can I host DevFlow AI myself?",
    a: "Absolutely. Clone the repo, add your environment variables, and deploy anywhere that runs Next.js: Vercel, Railway, or your own server.",
  },
  {
    id: "faq-4",
    q: "Is my code safe when I connect a repository?",
    a: "A repo is only indexed when you explicitly connect it. Access tokens are used once to fetch the code and never stored. The indexed code lives in your own database, and nothing leaves your stack beyond the AI API calls you choose to make.",
  },
  {
    id: "faq-5",
    q: "How do I contribute?",
    a: "Open a PR on GitHub. All contributions are welcome, bug fixes, features, docs, and design improvements.",
  },
  {
    id: "faq-6",
    q: "What AI models does DevFlow AI use?",
    a: "Claude Opus (claude-opus-4-8) for standup summaries, weekly digests, codebase answers, and onboarding docs, and OpenAI's text-embedding-3-small for semantic code search.",
  },
];

function FaqItem({ item, openValue }: { item: (typeof FAQ_ITEMS)[number]; openValue: string }) {
  const isOpen = openValue === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <AccordionPrimitive.Item
        value={item.id}
        className="mb-3 bg-canvas-base border border-canvas-border/50 rounded-xl px-5 overflow-hidden"
      >
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between py-4 text-left text-canvas-text-contrast font-medium text-sm hover:text-primary-text transition-colors outline-none">
            <span>{item.q}</span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.22 }}
              className="ml-4 shrink-0 text-canvas-text"
            >
              <PiCaretDown />
            </motion.span>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>

        <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <p className="text-canvas-text text-sm pb-4 leading-relaxed">{item.a}</p>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </motion.div>
  );
}

function FaqSection() {
  const [openValue, setOpenValue] = useState("");

  return (
    <section id="faq" className="py-24 px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-primary-text text-xs tracking-widest uppercase font-medium">FAQ</p>
        <h2 className="text-canvas-text-contrast text-4xl font-semibold mt-2">Questions you&apos;ll probably ask</h2>
      </motion.div>

      <motion.div
        className="mt-12 max-w-3xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <AccordionPrimitive.Root
          type="single"
          collapsible
          value={openValue}
          onValueChange={setOpenValue}
          className="flex w-full flex-col"
        >
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.id} item={item} openValue={openValue} />
          ))}
        </AccordionPrimitive.Root>
      </motion.div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="cta" className="bg-canvas-base py-16 px-6">
      <motion.div
        className="max-w-4xl mx-auto bg-primary-bg border border-primary-border/50 rounded-3xl p-12 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="text-primary-solid text-5xl mx-auto w-fit">
          <PiRocketLaunch />
        </div>

        <h2 className="text-canvas-text-contrast text-4xl font-semibold mt-4">Built for developers, by developers.</h2>
        <p className="text-primary-text text-lg mt-3">Open source, free forever, and yours to host. Bring your own API keys and own your data completely.</p>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="bg-primary-solid text-primary-on-primary">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>

        <div className="mt-6">
          <GithubStars />
          <p className="text-canvas-text text-sm mt-4">
            Fork it, run it on your own stack, and if it saves your team time, a star helps other teams find it.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default function FAQAndCTA() {
  return (
    <>
      <WaveDivider />
      <FaqSection />
      <div style={{ transform: "scaleX(-1)" }} className="bg-canvas-bg-subtle text-canvas-border/30">
        <WaveDivider />
      </div>
      <CtaSection />
    </>
  );
}