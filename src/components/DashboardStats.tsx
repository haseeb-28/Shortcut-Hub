"use client";

import {
  Boxes,
  Clock3,
  MousePointerClick,
  RefreshCw,
  Tags,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { buildAnalytics } from "@/lib/analytics";
import { getCategoryStyle, timeAgo } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface Props {
  shortcuts: ShortcutViewModel[];
  loading: boolean;
  onAdd: () => void;
}

export function DashboardStats({
  shortcuts,
  loading,
  onAdd,
}: Props) {
  if (loading) {
    return <StatsSkeleton />;
  }

  const stats = buildAnalytics(shortcuts);

  const mostUsedAccent = stats.mostUsedCategory
    ? getCategoryStyle(
        stats.mostUsedCategory.category
      ).accent
    : "#94A3B8";

  return (
    <section className="mb-8">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-amber">
            Overview
          </p>

          <h1 className="font-display text-2xl font-bold tracking-tight text-mist sm:text-3xl">
            Your Shortcut Hub
          </h1>

          <p className="mt-1 font-body text-sm text-ink2">
            Everything you need, one click away.
          </p>
        </div>

        <div className="hidden items-center gap-2 font-mono text-[10px] text-ink2 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          {shortcuts.length}{" "}
          {shortcuts.length === 1
            ? "shortcut"
            : "shortcuts"}{" "}
          active
        </div>
      </motion.div>

      {/* Statistics grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Boxes}
          label="Total Shortcuts"
          value={String(shortcuts.length)}
          sublabel={
            shortcuts.length === 1
              ? "shortcut saved"
              : "shortcuts saved"
          }
          index={0}
          accent="#F2B705"
        />

        <StatCard
          icon={Tags}
          label="Categories"
          value={String(stats.categoryCount)}
          sublabel="organized groups"
          index={1}
          accent="#34D399"
        />

        <StatCard
          icon={TrendingUp}
          label="Most Used"
          value={
            stats.mostUsedCategory?.category ??
            "—"
          }
          sublabel={
            stats.mostUsedCategory
              ? `${stats.mostUsedCategory.count} shortcuts`
              : undefined
          }
          index={2}
          accent={mostUsedAccent}
        />

        <StatCard
          icon={Clock3}
          label="Recently Added"
          value={
            stats.mostRecent?.name ?? "—"
          }
          sublabel={
            stats.mostRecent
              ? timeAgo(stats.mostRecent.created)
              : undefined
          }
          index={3}
          accent="#A78BFA"
        />

        <StatCard
          icon={RefreshCw}
          label="Last Updated"
          value={
            stats.lastUpdated
              ? timeAgo(stats.lastUpdated.updated)
              : "—"
          }
          sublabel={
            stats.lastUpdated?.name
          }
          index={4}
          accent="#60A5FA"
        />

        <StatCard
          icon={MousePointerClick}
          label="Total Visits"
          value="—"
          sublabel="tracking unavailable"
          index={5}
          accent="#22D3EE"
        />
      </div>

      {/* Quick action */}
      <QuickActionsCard onAdd={onAdd} />
    </section>
  );
}

function QuickActionsCard({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onAdd}
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: 0.25,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -2,
        scale: 1.005,
      }}
      whileTap={{
        scale: 0.99,
      }}
      className="group relative mt-3 flex w-full items-center justify-between overflow-hidden rounded-xl border border-amber/20 bg-ink-700/40 px-4 py-3 text-left backdrop-blur-sm transition-colors duration-300 hover:border-amber/40 hover:bg-ink-700/60"
    >
      {/* Ambient glow */}
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <span className="relative flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber/20 bg-amber/10 text-amber transition-transform duration-300 group-hover:scale-105">
          <Zap className="h-4 w-4" />
        </span>

        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold text-mist">
            Quick add
          </span>

          <span className="block truncate font-body text-xs text-ink2">
            Save a new shortcut in one click
          </span>
        </span>
      </span>

      <span className="relative hidden shrink-0 rounded-md border border-border bg-ink-600/60 px-2 py-1 font-mono text-[10px] text-ink2 sm:block">
        ⌘K also works
      </span>
    </motion.button>
  );
}

function StatsSkeleton() {
  return (
    <section className="mb-8">
      <div className="mb-5">
        <div className="h-2.5 w-20 animate-pulse rounded bg-ink-600" />

        <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-ink-700" />

        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-ink-700" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.25,
              delay: index * 0.04,
            }}
            className="h-[116px] animate-pulse rounded-xl border border-border bg-ink-700/40"
          />
        ))}
      </div>

      <div className="mt-3 h-[62px] animate-pulse rounded-xl border border-border bg-ink-700/40" />
    </section>
  );
}