"use client";

import {
  Boxes,
  Clock3,
  MousePointerClick,
  RefreshCw,
  Tags,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { buildAnalytics } from "@/lib/analytics";
import { getCategoryStyle, timeAgo } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface Props {
  shortcuts: ShortcutViewModel[];
  loading: boolean;
}

export function DashboardStats({
  shortcuts,
  loading,
}: Props) {
  if (loading) {
    return <StatsSkeleton />;
  }

  const stats = buildAnalytics(shortcuts);

  const mostUsedAccent = stats.mostUsedCategory
    ? getCategoryStyle(
        stats.mostUsedCategory.category
      ).accent
    : "var(--category-other)";

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
          accent="var(--amber)"
        />

        <StatCard
          icon={Tags}
          label="Categories"
          value={String(stats.categoriesUsed)}
          sublabel="organized groups"
          index={1}
          accent="var(--category-development)"
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
          accent="var(--category-ai)"
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
          accent="var(--category-education)"
        />

        <StatCard
          icon={MousePointerClick}
          label="Total Visits"
          value="—"
          sublabel="tracking unavailable"
          index={5}
          accent="var(--category-social)"
        />
      </div>

    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="mb-8">
      <div className="mb-5">
        <div         className="neu-inset h-2.5 w-20 animate-pulse rounded" />

        <div         className="neu-inset mt-3 h-8 w-64 animate-pulse rounded-lg" />

        <div         className="neu-inset mt-2 h-4 w-48 animate-pulse rounded" />
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
            className="neu-surface h-[116px] animate-pulse rounded-xl border"
          />
        ))}
      </div>

    </section>
  );
}