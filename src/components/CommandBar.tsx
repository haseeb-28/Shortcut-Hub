"use client";

import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  total: number;
  /** Called on Enter — page.tsx wires this to open the first visible result. */
  onEnter?: () => void;
}

export function CommandBar({ value, onChange, onClose, total, onEnter }: Props) {

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (value) {
        e.preventDefault();
        onChange("");
      } else {
        onClose();
      }
    } else if (e.key === "Enter" && value.trim()) {
      onEnter?.();
    }
  }

  return (
    <div>
      <div className="group relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink2"
          strokeWidth={2}
        />
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${total} shortcuts by name or category…`}
          aria-label="Search shortcuts"
          className="neu-inset w-full rounded-xl border py-3 pl-11 pr-16 font-mono text-sm text-mist placeholder:text-ink2/90 outline-none transition focus:border-amber/70 focus:shadow-glow"
        />
        {value ? (
          <button
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-ink2 transition hover:text-mist"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-ink-600 px-1.5 py-0.5 font-mono text-[10px] text-ink2 sm:flex">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        )}
      </div>
    </div>
  );
}
