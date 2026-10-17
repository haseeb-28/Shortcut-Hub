"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";

interface Props {
  target: ShortcutViewModel | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ target, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {target && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="neu-surface w-full max-w-sm rounded-2xl border p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger/15 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-semibold text-mist">Remove {target.name}?</h2>
            <p className="mt-1.5 font-body text-sm text-ink2">
              This deletes the shortcut from your list. You can always add it back later.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg px-4 py-2 font-display text-sm text-ink2 transition hover:text-mist"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="neu-button rounded-lg bg-danger px-4 py-2 font-display text-sm font-semibold text-button transition hover:bg-danger/90"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
