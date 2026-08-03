"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sublabel?: string;
  accent?: string;
  index?: number;
  isPlaceholder?: boolean;
}

export function StatCard({ icon: Icon, label, value, sublabel, accent = "#F2B705", index = 0, isPlaceholder }: Props) {
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-ink-700/70 to-ink-700/30 p-4 shadow-card backdrop-blur-sm transition-colors hover:border-ink-500"
    >
      {/* subtle radial glow that appears on hover — glassmorphism accent, not a full redesign */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink2">{label}</p>
          <p className="mt-1.5 truncate font-display text-2xl font-semibold text-mist">
            {isNumeric ? <AnimatedCounter value={value} /> : value}
            {isPlaceholder && <span className="ml-1.5 align-middle font-mono text-[10px] text-ink2">soon</span>}
          </p>
          {sublabel && <p className="mt-1 truncate font-body text-xs text-ink2">{sublabel}</p>}
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1F`, color: accent }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
