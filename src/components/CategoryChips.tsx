"use client";

import { CATEGORIES, type Category } from "@/domain/entities/shortcut";
import { CATEGORY_STYLE, cn } from "@/lib/utils";

interface Props {
  active: Category | "All";
  onSelect: (category: Category | "All") => void;
  counts: Map<string, number>;
  total: number;
}

export function CategoryChips({ active, onSelect, counts, total }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        label="All"
        count={total}
        active={active === "All"}
        onClick={() => onSelect("All")}
        accent="#F2B705"
      />
      {CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0).map((category) => (
        <Chip
          key={category}
          label={category}
          count={counts.get(category) ?? 0}
          active={active === category}
          onClick={() => onSelect(category)}
          accent={CATEGORY_STYLE[category].accent}
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
      style={active ? { borderColor: accent, color: accent } : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition",
        active
          ? "bg-ink-600"
          : "border-border bg-ink-700/50 text-ink2 hover:border-ink-500 hover:text-mist"
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: active ? accent : "#3A4870" }}
      />
      {label}
      <span className="text-[10px] opacity-70">{count}</span>
    </button>
  );
}
