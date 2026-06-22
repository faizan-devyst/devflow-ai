"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PiGithubLogo,
  PiTwitterLogo,
  PiLinkedinLogo,
} from "react-icons/pi";

import { usePathname } from "next/navigation";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "CTA", href: "/#cta" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/faizan-devstack", icon: PiGithubLogo },
  { label: "Twitter", href: "https://twitter.com/Faizan_devstack", icon: PiTwitterLogo },
  { label: "LinkedIn", href: "https://linkedin.com/in/ifaizan114", icon: PiLinkedinLogo },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterLinkGroup({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-canvas-text-contrast text-sm font-medium">{heading}</p>
      <ul className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-canvas-text hover:text-canvas-text-contrast text-sm transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-canvas-bg-subtle border-t border-canvas-border/50"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-8">

          <div className="flex flex-col gap-4">

            <Link href="/" className="flex items-center gap-0.5 w-fit">
              <span className="text-canvas-text-contrast font-semibold text-lg tracking-tight">
                DevFlow
              </span>
              <span className="text-primary-solid font-semibold text-lg tracking-tight">
                AI
              </span>
            </Link>

            <p className="text-canvas-text text-sm max-w-[200px] leading-relaxed">
              Async standups and codebase onboarding for dev teams.
            </p>

            <div className="flex items-center gap-3 mt-1">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-canvas-text hover:text-primary-text transition-colors"
                >
                  <Icon size={22} />
                </Link>
              ))}
            </div>
          </div>

          <FooterLinkGroup heading="Product" links={PRODUCT_LINKS} />

          <FooterLinkGroup heading="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-10 pt-6 border-t border-canvas-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-canvas-text text-xs">
            © 2026 DevFlow AI. All rights reserved.
          </p>
          <p className="text-canvas-text text-xs italic">
            Built for dev teams who ship.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}