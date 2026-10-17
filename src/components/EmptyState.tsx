"use client";

import { PlusCircle, Radar } from "lucide-react";

interface Props {
  variant: "first-run" | "no-results";
  onAdd: () => void;
}

export function EmptyState({ variant, onAdd }: Props) {
  const isFirstRun = variant === "first-run";
  return (
    <div className="neu-surface flex flex-col items-center gap-4 rounded-2xl border border-dashed py-16 text-center sm:py-20">
      <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-full border text-amber">
        {isFirstRun ? <PlusCircle className="h-6 w-6" /> : <Radar className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-display text-base font-semibold text-mist">
          {isFirstRun ? "No shortcuts yet" : "Nothing matches that search"}
        </p>
        <p className="mt-1 max-w-xs font-body text-sm text-ink2">
          {isFirstRun
            ? "Add the first site you want one click away."
            : "Try a different name or category, or clear the filter."}
        </p>
      </div>
      {isFirstRun && (
        <button
          onClick={onAdd}
          className="neu-button rounded-lg bg-amber px-4 py-2 font-display text-sm font-semibold text-button transition hover:bg-amber-soft"
        >
          Add your first shortcut
        </button>
      )}
    </div>
  );
}
