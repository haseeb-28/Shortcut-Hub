"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
  index?: number;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, index = 0, children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.32), ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border border-border bg-ink-700/40 p-4 shadow-card sm:p-5 ${className ?? ""}`}
    >
      <div className="mb-4">
        <h3 className="font-display text-sm font-semibold text-mist">{title}</h3>
        {subtitle && <p className="mt-0.5 font-mono text-[11px] text-ink2">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
