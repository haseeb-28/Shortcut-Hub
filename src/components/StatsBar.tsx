"use client";

interface Props {
  total: number;
  available: number;
  missing: number;
  visibleCount: number;
}

export function StatsBar({ total, available, missing, visibleCount }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-ink2">
      <Stat label="Total" value={total} />
      <Dot />
      <Stat label="Available" value={available} tone="text-teal" />
      {missing > 0 && (
        <>
          <Dot />
          <Stat label="Missing" value={missing} tone="text-danger" />
        </>
      )}
      <Dot />
      <span>
        Showing <span className="text-mist">{visibleCount}</span>
      </span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <span>
      {label} <span className={tone ?? "text-mist"}>{value}</span>
    </span>
  );
}

function Dot() {
  return <span className="text-ink-500">·</span>;
}
