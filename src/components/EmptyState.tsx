"use client";

import { PlusCircle, Radar } from "lucide-react";

interface Props {
  variant: "first-run" | "no-results";
  onAdd: () => void;
}

export function EmptyState({ variant, onAdd }: Props) {
  const isFirstRun = variant === "first-run";
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-600 text-amber">
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
          className="rounded-lg bg-amber px-4 py-2 font-display text-sm font-semibold text-ink-900 transition hover:bg-amber-soft"
        >
          Add your first shortcut
        </button>
      )}
    </div>
  );
}
