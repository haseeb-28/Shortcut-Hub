"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, LayoutGrid, LogOut, Menu, Radio, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onLogout: () => void;
}

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavBar({ onLogout }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber text-ink-900">
            <Radio className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-mist">Shortcut Hub</h1>
            <p className="font-mono text-[11px] text-ink2">your personal launchpad</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-lg border border-border bg-ink-700/40 p-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition",
                  active ? "text-ink-900" : "text-ink2 hover:text-mist"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-amber"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-mono text-xs text-ink2 transition hover:border-ink-500 hover:text-mist sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink2 transition hover:text-mist sm:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex flex-col gap-1 overflow-hidden rounded-lg border border-border bg-ink-700/40 p-1 sm:hidden"
          >
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs transition",
                    active ? "bg-amber text-ink-900" : "text-ink2 hover:text-mist"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs text-ink2 transition hover:text-mist"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
