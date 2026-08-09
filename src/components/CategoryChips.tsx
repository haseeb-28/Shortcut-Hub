"use client";

import { getCategoryStyle, cn } from "@/lib/utils";

interface Props {
  active: string | "All";
  onSelect: (category: string | "All") => void;
  counts: Map<string, number>;
  total: number;
}

export function CategoryChips({
  active,
  onSelect,
  counts,
  total,
}: Props) {
  const categories = [...counts.keys()].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <section
      aria-label="Shortcut categories"
      className="rounded-2xl border border-border bg-ink-800/70 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-mist">
            Categories
          </h3>

          <p className="mt-0.5 font-mono text-[10px] text-ink2">
            Filter your shortcuts by category
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-border bg-ink-700 px-2.5 py-1 font-mono text-[10px] text-ink2">
          {categories.length} categories
        </span>
      </div>

      {/* Visible category buttons */}
      <div className="flex flex-wrap gap-2">
        <Chip
          label="All"
          count={total}
          active={active === "All"}
          onClick={() => onSelect("All")}
          accent="#F2B705"
        />

        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            count={counts.get(category) ?? 0}
            active={active === category}
            onClick={() => onSelect(category)}
            accent={getCategoryStyle(category).accent}
          />
        ))}
      </div>
    </section>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={
        active
          ? {
              borderColor: accent,
              color: accent,
              boxShadow: `0 0 0 1px ${accent}20, 0 4px 18px ${accent}12`,
            }
          : undefined
      }
      className={cn(
        "group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 font-mono text-xs transition-all duration-200",
        active
          ? "bg-ink-600"
          : "border-border bg-ink-700/70 text-ink2 hover:border-ink-500 hover:bg-ink-600 hover:text-mist"
      )}
    >
      {/* Category indicator */}
      <span
        className="h-2 w-2 shrink-0 rounded-full transition-all duration-200"
        style={{
          backgroundColor: active ? accent : "#3A4870",
          boxShadow: active ? `0 0 8px ${accent}70` : "none",
        }}
      />

      {/* Category name */}
      <span className="whitespace-nowrap">{label}</span>

      {/* Count */}
      <span
        className={cn(
          "rounded-md px-1.5 py-0.5 text-[10px]",
          active
            ? "bg-white/[0.08] opacity-100"
            : "bg-white/[0.04] opacity-70"
        )}
      >
        {count}
      </span>
    </button>
  );
}