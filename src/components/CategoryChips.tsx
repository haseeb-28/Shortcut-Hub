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
      onClick={onClick}
      style={
        active
          ? {
              borderColor: accent,
              color: accent,
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition",
        active
          ? "bg-ink-600"
          : "border-border bg-ink-700/50 text-ink2 hover:border-ink-500 hover:text-mist"
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: active
            ? accent
            : "#3A4870",
        }}
      />

      {label}

      <span className="text-[10px] opacity-70">
        {count}
      </span>
    </button>
  );
}