"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, Tags, TrendingUp } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useShortcuts } from "@/hooks/useShortcuts";

import { buildAnalytics } from "@/lib/analytics";
import { getCategoryStyle } from "@/lib/utils";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import { ToastStack } from "@/components/ToastStack";

const CategoryBarChart = dynamic(
  () =>
    import("@/components/charts/CategoryBarChart").then(
      (m) => m.CategoryBarChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const CategoryPieChart = dynamic(
  () =>
    import("@/components/charts/CategoryPieChart").then(
      (m) => m.CategoryPieChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const GrowthLineChart = dynamic(
  () =>
    import("@/components/charts/GrowthLineChart").then(
      (m) => m.GrowthLineChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const GrowthAreaChart = dynamic(
  () =>
    import("@/components/charts/GrowthAreaChart").then(
      (m) => m.GrowthAreaChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export default function AnalyticsPage() {
  const router = useRouter();

  const { isAuthed, ready, logout } = useAuth();

  const {
    shortcuts,
    loading,
    error,
    toasts,
  } = useShortcuts();

  useEffect(() => {
    if (ready && !isAuthed) {
      router.replace("/login");
    }
  }, [ready, isAuthed, router]);

  const analytics = useMemo(
    () => buildAnalytics(shortcuts),
    [shortcuts]
  );

  if (!ready || !isAuthed) return null;

  const mostUsedAccent = analytics.mostUsedCategory
    ? getCategoryStyle(
        analytics.mostUsedCategory.category
      ).accent
    : "#94A3B8";

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NavBar onLogout={logout} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-mist">
            Analytics
          </h2>

          <p className="mt-1 font-mono text-[11px] text-ink2">
            Insights generated from your saved shortcuts
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && shortcuts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-20 text-center">
            <p className="font-display text-base font-semibold text-mist">
              Nothing to analyze yet
            </p>

            <p className="max-w-xs font-body text-sm text-ink2">
              Add a few shortcuts on the dashboard and this
              page fills in automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                icon={Boxes}
                label="Total Shortcuts"
                value={analytics.total}
                index={0}
                accent="#F2B705"
              />

              <StatCard
                icon={Tags}
                label="Categories Used"
                value={analytics.categoriesUsed}
                index={1}
                accent="#4FD1C5"
              />

              <StatCard
                icon={TrendingUp}
                label="Most Active Category"
                value={
                  analytics.mostUsedCategory?.category ?? "—"
                }
                sublabel={
                  analytics.mostUsedCategory
                    ? `${analytics.mostUsedCategory.count} of ${analytics.total} shortcuts`
                    : undefined
                }
                index={2}
                accent={mostUsedAccent}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CategoryBarChart
                data={analytics.categoryDistribution}
                index={0}
              />

              <CategoryPieChart
                data={analytics.categoryDistribution}
                index={1}
              />

              <GrowthLineChart
                data={analytics.monthlyGrowth}
                index={2}
              />

              <GrowthAreaChart
                data={analytics.monthlyGrowth}
                index={3}
              />
            </div>
          </>
        )}
      </motion.div>

      <Footer />

      <ToastStack toasts={toasts} />
    </main>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[21.5rem] animate-pulse rounded-xl border border-border bg-ink-700/40" />
  );
}