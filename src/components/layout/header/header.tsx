"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { markSigningOut } from "@/components/providers/auth-provider";
import { PiList, PiBell } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANDING_LINKS: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "About Us", href: "/about" },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-0.5 shrink-0">
      <span className="text-canvas-text-contrast font-semibold text-lg tracking-tight">
        DevFlow
      </span>
      <span className="text-primary-solid font-semibold text-lg tracking-tight">
        AI
      </span>
    </Link>
  );
}

// ─── Nav Link (desktop) ───────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const linkEl = (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative text-sm transition-colors duration-150 px-1 py-0.5 ${isActive
        ? "text-primary-solid"
        : "text-canvas-text hover:text-canvas-text-contrast"
        }`}
    >
      {label}

      <AnimatePresence>
        {hovered && !isActive && (
          <motion.span
            layoutId="hover-indicator"
            className="absolute bottom-0 left-0 right-0 h-px bg-primary-solid"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </Link>
  );

  return linkEl;
}

// ─── User Avatar ──────────────────────────────────────────────────────────────

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary-bg text-primary-text text-xs font-semibold flex items-center justify-center select-none cursor-pointer border border-canvas-border/50">
      {initials}
    </div>
  );
}

// ─── Logged-Out Nav ───────────────────────────────────────────────────────────

function LoggedOutDesktopNav() {
  return (
    <>
      <nav className="hidden md:flex items-center gap-6">
        {LANDING_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} />
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-2">
        <ThemeToggle />
        <Button size="sm" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </>
  );
}

// ─── Logged-In Nav ────────────────────────────────────────────────────────────

function LoggedInDesktopNav({
  initials,
  onSignOut,
}: {
  initials: string;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Right: bell + avatar */}
      <div className="hidden md:flex items-center gap-3 ml-auto">
        <ThemeToggle />

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="text-canvas-text hover:text-canvas-text-contrast transition-colors p-1 rounded-md hover:bg-canvas-subtle"
        >
          <PiBell size={18} />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="User menu">
              <UserAvatar initials={initials} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-44 bg-canvas-base border border-canvas-border/50 rounded-lg py-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="text-sm text-canvas-text hover:text-canvas-text-contrast cursor-pointer"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-canvas-border/50" />
              <DropdownMenuItem
                onClick={onSignOut}
                className="text-sm text-canvas-text hover:text-canvas-text-contrast cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

// ─── Mobile Sheet ─────────────────────────────────────────────────────────────

function MobileMenu({
  isLoggedIn,
  onSignOut,
}: {
  isLoggedIn: boolean;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const links = LANDING_LINKS;

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open menu"
            className="text-canvas-text hover:text-canvas-text-contrast transition-colors p-1"
          >
            <PiList size={22} />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 bg-canvas-base border-l border-canvas-border/50 pt-12 px-6"
        >
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = false
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm px-3 py-2.5 rounded-md transition-colors ${isActive
                    ? "text-primary-solid bg-primary-bg/30"
                    : "text-canvas-text hover:text-canvas-text-contrast hover:bg-canvas-subtle"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-2 border-t border-canvas-border/50 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-canvas-text">Theme</span>
              <ThemeToggle />
            </div>

            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onSignOut();
                  setOpen(false);
                }}
              >
                Sign out
              </Button>
            ) : (
              <>
                <Button size="sm" asChild>
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;

  // Derive initials from user name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSignOut = () => {
    markSigningOut();
    signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  };

  const logoHref = isSignedIn ? "/dashboard" : "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 h-16 bg-canvas-base/80 backdrop-blur-md border-b border-canvas-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-6">
        {/* Logo */}
        <Logo href={logoHref} />

        {/* Desktop nav + right actions */}
        {isSignedIn ? (
          <LoggedInDesktopNav initials={initials} onSignOut={handleSignOut} />
        ) : (
          <LoggedOutDesktopNav />
        )}

        {/* Mobile hamburger */}
        <MobileMenu isLoggedIn={isSignedIn} onSignOut={handleSignOut} />
      </div>
    </motion.header>
  );
}
