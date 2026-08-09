import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import type { Category } from "@/domain/entities/shortcut";

export interface CategorySlice {
  category: Category;
  count: number;
  percentage: number;
}

export interface MonthlyPoint {
  /** e.g. "Jan 2026" */
  label: string;
  monthKey: string;
  added: number;
  cumulative: number;
}

export interface AnalyticsSummary {
  categoryCount(categoryCount: any): string | number;
  total: number;
  categoriesUsed: number;
  mostUsedCategory: {
    category: Category;
    count: number;
  } | null;
  available: number;
  missing: number;
  mostRecent: ShortcutViewModel | null;
  lastUpdated: ShortcutViewModel | null;
  categoryDistribution: CategorySlice[];
  monthlyGrowth: MonthlyPoint[];
}

/**
 * Everything here is derived client-side from the shortcut list the app
 * already fetches for the main grid, so no additional Appwrite queries
 * are required.
 *
 * Keeping this pure, with no React or SDK dependencies, makes it easy
 * to unit-test and safe to reuse from both the dashboard and Analytics page.
 */
export function buildAnalytics(
  shortcuts: ShortcutViewModel[]
): AnalyticsSummary {
  const total = shortcuts.length;

  const byCategory = new Map<Category, number>();

  for (const shortcut of shortcuts) {
    byCategory.set(
      shortcut.category,
      (byCategory.get(shortcut.category) ?? 0) + 1
    );
  }

  const categoryDistribution: CategorySlice[] = Array.from(
    byCategory.entries()
  )
    .map(([category, count]) => ({
      category,
      count,
      percentage:
        total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const mostUsedCategory = categoryDistribution[0]
    ? {
        category: categoryDistribution[0].category,
        count: categoryDistribution[0].count,
      }
    : null;

  const available = shortcuts.filter(
    (shortcut) => shortcut.status === "Available"
  ).length;

  const missing = total - available;

  const byCreatedDesc = [...shortcuts].sort(
    (a, b) =>
      new Date(b.created).getTime() -
      new Date(a.created).getTime()
  );

  const byUpdatedDesc = [...shortcuts].sort(
    (a, b) =>
      new Date(b.updated).getTime() -
      new Date(a.updated).getTime()
  );

  return {
  total,
  categoriesUsed: byCategory.size,
  mostUsedCategory,
  available,
  missing,
  mostRecent: byCreatedDesc[0] ?? null,
  lastUpdated: byUpdatedDesc[0] ?? null,
  categoryDistribution,
  monthlyGrowth: buildMonthlyGrowth(shortcuts),
  categoryCount(category: Category | string | null): string | number {
    // If a Category or string is passed, return the count for that
    // category from the distribution; otherwise return a dash.
    if (!category) return "-";

    const slice = categoryDistribution.find(
      (s) => s.category === (category as Category)
    );

    return slice ? slice.count : 0;
  },
};
}

function buildMonthlyGrowth(
  shortcuts: ShortcutViewModel[]
): MonthlyPoint[] {
  if (shortcuts.length === 0) {
    return [];
  }

  const sorted = [...shortcuts].sort(
    (a, b) =>
      new Date(a.created).getTime() -
      new Date(b.created).getTime()
  );

  const addedByMonth = new Map<string, number>();

  for (const shortcut of sorted) {
    const date = new Date(shortcut.created);

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    addedByMonth.set(
      key,
      (addedByMonth.get(key) ?? 0) + 1
    );
  }

  // Fill every month between the first and last entry so that
  // gaps appear as flat segments in the analytics charts.
  const firstDate = new Date(sorted[0].created);
  const lastDate = new Date(
    sorted[sorted.length - 1].created
  );

  const cursor = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    1
  );

  const end = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    1
  );

  const points: MonthlyPoint[] = [];
  let cumulative = 0;

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(
      cursor.getMonth() + 1
    ).padStart(2, "0")}`;

    const added = addedByMonth.get(key) ?? 0;

    cumulative += added;

    points.push({
      label: formatter.format(cursor),
      monthKey: key,
      added,
      cumulative,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
}