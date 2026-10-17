"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  LayoutGrid,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CommandBar } from "./CommandBar";

interface Props {
  search?: {
    value: string;
    onChange: (value: string) => void;
    total: number;
    onEnter?: () => void;
  };
}

const LINKS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function NavBar({ search }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!search) return;

    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, [search]);

  return (
    <header className="neu-surface relative z-50 mb-8 rounded-2xl border p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Link */}
        <Link
          href="/"
          aria-label="Shortcut Hub dashboard"
          className="group flex min-w-0 items-center gap-3.5"
        >
          {/* 3D App Logo Container (Matches SplashScreen) */}
          <motion.div
            whileHover={{
              rotateY: 12,
              rotateX: -8,
              scale: 1.06,
            }}
            whileTap={{
              scale: 0.94,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
            }}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center select-none"
            style={{
              perspective: 600,
            }}
          >
            {/* Ambient Radial Glow */}
            <div
              className="pointer-events-none absolute inset-[-6px] rounded-full bg-amber/20 blur-lg transition-opacity duration-300 opacity-60 group-hover:opacity-100"
              aria-hidden="true"
            />

            {/* Continuous Rotating Ring */}
            <motion.div
              animate={{
                rotateZ: 360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute inset-[-3px] rounded-2xl border border-dashed border-amber/20"
              aria-hidden="true"
            />

            {/* Main 3D Logo Tile */}
            <div
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-amber/50 bg-gradient-to-br from-amber via-amber/90 to-amber-soft shadow-[0_10px_25px_var(--glow-amber)]"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Back depth layer */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-ink-800/60"
                style={{
                  transform: "translateZ(-4px) translate(2px, 3px)",
                }}
                aria-hidden="true"
              />

              {/* Logo Asset */}
              <div
                className="relative z-10 flex items-center justify-center"
                style={{
                  transform: "translateZ(8px)",
                }}
              >
                <Image
                  src="/shortcut-hub-logo.png"
                  alt="Shortcut Hub"
                  width={24}
                  height={24}
                  priority
                  className="h-6 w-6 object-contain invert"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))",
                  }}
                />
              </div>

              {/* Glass highlight */}
              <div
                className="pointer-events-none absolute inset-[1px] rounded-[14px] bg-gradient-to-br from-white/30 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Moving shine sweep */}
              <motion.div
                animate={{
                  x: ["-150%", "150%"],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute h-full w-1/2 skew-x-[-20deg] bg-white/20 blur-sm"
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* Brand Text */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold tracking-tight text-mist transition-colors duration-200 group-hover:text-white">
                Shortcut
              </span>

              <span className="font-display text-lg font-bold tracking-tight text-amber">
                Hub
              </span>
            </div>

            <p className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-ink2">
              Your personal launchpad
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="neu-inset hidden items-center gap-1 rounded-xl border p-1 sm:flex"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2",
                  "font-mono text-xs transition-colors duration-200",
                  active
                    ? "text-button"
                    : "text-ink2 hover:text-mist"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-amber shadow-[0_0_18px_var(--glow-amber)]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <Icon className="relative z-10 h-3.5 w-3.5" />

                <span className="relative z-10">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {search && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="neu-button flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-ink-800 text-ink2 transition-colors hover:border-amber/50 hover:text-mist"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{
              scale: 0.92,
            }}
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="neu-button flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-ink-800 text-ink2 transition-colors hover:border-ink-500 hover:text-mist sm:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{
                    opacity: 0,
                    rotate: -90,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 90,
                    scale: 0.7,
                  }}
                >
                  <X className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{
                    opacity: 0,
                    rotate: 90,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: -90,
                    scale: 0.7,
                  }}
                >
                  <Menu className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {search && searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="neu-surface absolute right-3 top-[calc(100%+0.75rem)] z-50 w-[min(34rem,calc(100vw-2rem))] rounded-2xl border p-3"
          >
            <CommandBar
              value={search.value}
              onChange={search.onChange}
              onClose={() => setSearchOpen(false)}
              total={search.total}
              onEnter={search.onEnter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{
              opacity: 0,
              height: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -8,
            }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-label="Mobile navigation"
            className="neu-surface mt-3 overflow-hidden rounded-xl border p-1 sm:hidden"
          >
            {LINKS.map((link, index) => {
              const active = pathname === link.href;
              const Icon = link.icon;

              return (
                <motion.div
                  key={link.href}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5",
                      "font-mono text-xs transition-colors",
                      active
                        ? "bg-amber text-button"
                        : "text-ink2 hover:bg-ink-600 hover:text-mist"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}

          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}