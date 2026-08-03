"use client";

import { Boxes, Clock3, MousePointerClick, RefreshCw, Tags, TrendingUp, Zap } from "lucide-react";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { buildAnalytics } from "@/lib/analytics";
import { CATEGORY_STYLE, timeAgo } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface Props {
  shortcuts: ShortcutViewModel[];
  loading: boolean;
  onAdd: () => void;
}

export function DashboardStats({ shortcuts, loading, onAdd }: Props) {
  if (loading) return <StatsSkeleton />;

  const stats = buildAnalytics(shortcuts);
  const mostUsedAccent = stats.mostUsedCategory ? CATEGORY_STYLE[stats.mostUsedCategory.category].accent : "#94A3B8";

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard icon={Boxes} label="Total Shortcuts" value={stats.total} index={0} accent="#F2B705" />
      <StatCard icon={Tags} label="Categories Used" value={stats.categoriesUsed} index={1} accent="#4FD1C5" />
      <StatCard
        icon={TrendingUp}
        label="Most Used"
        value={stats.mostUsedCategory?.category ?? "—"}
        sublabel={stats.mostUsedCategory ? `${stats.mostUsedCategory.count} shortcuts` : undefined}
        index={2}
        accent={mostUsedAccent}
      />
      <StatCard
        icon={Clock3}
        label="Recently Added"
        value={stats.mostRecent?.name ?? "—"}
        sublabel={stats.mostRecent ? timeAgo(stats.mostRecent.created) : undefined}
        index={3}
        accent="#A78BFA"
      />
      <StatCard
        icon={RefreshCw}
        label="Last Updated"
        value={stats.lastUpdated ? timeAgo(stats.lastUpdated.updated) : "—"}
        sublabel={stats.lastUpdated?.name}
        index={4}
        accent="#60A5FA"
      />
      {/* Total Visits has no backing data yet (no click-tracking attribute in the schema) —
          shown as an honest placeholder per spec rather than a fabricated number. */}
      <StatCard icon={MousePointerClick} label="Total Visits" value="—" sublabel="tracking coming soon" index={5} accent="#94A3B8" isPlaceholder />

      <QuickActionsCard onAdd={onAdd} />
    </div>
  );
}

function QuickActionsCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="group col-span-2 flex items-center justify-between rounded-xl border border-dashed border-border bg-ink-700/30 p-4 text-left transition hover:border-amber/50 hover:bg-ink-700/60 sm:col-span-3 lg:col-span-6"
    >
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/15 text-amber transition group-hover:bg-amber group-hover:text-ink-900">
          <Zap className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <span>
          <span className="block font-display text-sm font-semibold text-mist">Quick add</span>
          <span className="block font-mono text-[11px] text-ink2">Save a new shortcut in one click</span>
        </span>
      </span>
      <span className="font-mono text-[11px] text-ink2 opacity-0 transition group-hover:opacity-100">⌘K also works</span>
    </button>
  );
}

function StatsSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[86px] animate-pulse rounded-xl border border-border bg-ink-700/40" />
      ))}
    </div>
  );
}
