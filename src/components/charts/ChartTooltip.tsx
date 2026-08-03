"use client";

import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export function ChartTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-ink-800 px-3 py-2 shadow-2xl">
      {label && <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 font-body text-xs text-mist">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ink2">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
