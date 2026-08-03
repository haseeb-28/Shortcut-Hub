"use client";

import { AnimatePresence } from "framer-motion";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { ShortcutCard } from "./ShortcutCard";
import { EmptyState } from "./EmptyState";

interface Props {
  shortcuts: ShortcutViewModel[];
  hasAnyShortcuts: boolean;
  onEdit: (shortcut: ShortcutViewModel) => void;
  onDelete: (shortcut: ShortcutViewModel) => void;
  onAdd: () => void;
  /** Active search term, passed through for match highlighting. */
  query?: string;
}

export function ShortcutGrid({ shortcuts, hasAnyShortcuts, onEdit, onDelete, onAdd, query }: Props) {
  if (shortcuts.length === 0) {
    return (
      <EmptyState
        variant={hasAnyShortcuts ? "no-results" : "first-run"}
        onAdd={onAdd}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {shortcuts.map((shortcut, index) => (
          <ShortcutCard
            key={shortcut.id}
            shortcut={shortcut}
            index={index}
            query={query}
            onEdit={() => onEdit(shortcut)}
            onDelete={() => onDelete(shortcut)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
