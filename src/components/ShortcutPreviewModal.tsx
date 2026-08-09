"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Globe2,
  Pencil,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { cn, faviconFor, getCategoryStyle } from "@/lib/utils";

interface Props {
  shortcut: ShortcutViewModel | null;
  onClose: () => void;
  onEdit: (shortcut: ShortcutViewModel) => void;
  onDelete: (shortcut: ShortcutViewModel) => void;
}

export function ShortcutPreviewModal({
  shortcut,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const open = !!shortcut;

  const categoryStyle = shortcut
    ? getCategoryStyle(shortcut.category)
    : null;

  const favicon = shortcut
    ? faviconFor(shortcut.url)
    : null;

  function handleEdit() {
    if (!shortcut) return;

    onClose();
    onEdit(shortcut);
  }

  function handleDelete() {
    if (!shortcut) return;

    onClose();
    onDelete(shortcut);
  }

  return (
    <AnimatePresence>
      {open && shortcut && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-ink-900/75 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.94,
              rotateX: 4,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: 18,
              scale: 0.96,
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-ink-800 shadow-2xl"
          >
            {/* Category accent */}
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                backgroundColor: categoryStyle?.accent,
              }}
            />

            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-20 blur-3xl"
              style={{
                backgroundColor: categoryStyle?.accent,
              }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close shortcut preview"
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-ink2 transition hover:bg-ink-600 hover:text-mist"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start gap-4 pr-10">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.08,
                    type: "spring",
                    stiffness: 350,
                    damping: 22,
                  }}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-ink-700 shadow-lg"
                >
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="h-9 w-9 object-contain"
                    />
                  ) : (
                    <span
                      className="font-display text-xl font-bold"
                      style={{
                        color: categoryStyle?.accent,
                      }}
                    >
                      {shortcut.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </motion.div>

                <div className="min-w-0 pt-1">
                  <motion.h2
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="break-words font-display text-xl font-bold text-mist"
                  >
                    {shortcut.name}
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="mt-2 flex flex-wrap items-center gap-2"
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px]"
                      style={{
                        backgroundColor: categoryStyle?.bg,
                        color: categoryStyle?.text,
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      {shortcut.category}
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-mono text-[10px]",
                        shortcut.status === "Available"
                          ? "text-teal"
                          : "text-danger"
                      )}
                      style={{
                        backgroundColor:
                          shortcut.status === "Available"
                            ? "rgba(79,209,197,0.12)"
                            : "rgba(242,85,90,0.12)",
                      }}
                    >
                      {shortcut.status}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* URL section */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-6 rounded-xl border border-border bg-ink-700/60 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-amber" />

                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink2">
                    Website URL
                  </span>
                </div>

                <p className="break-all font-mono text-xs leading-relaxed text-mist">
                  {shortcut.url}
                </p>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.23 }}
                className="mt-3 grid grid-cols-2 gap-3"
              >
                <DetailItem
                  label="Category"
                  value={shortcut.category}
                  accent={categoryStyle?.accent}
                />

                <DetailItem
                  label="Status"
                  value={shortcut.status}
                  accent={
                    shortcut.status === "Available"
                      ? "#4FD1C5"
                      : "#F2555A"
                  }
                />
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mt-6 flex flex-col gap-2 sm:flex-row"
              >
                <a
                  href={shortcut.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-ink-900 transition hover:bg-amber-soft"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Website
                </a>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-ink-700 px-4 py-3 font-display text-sm font-medium text-mist transition hover:border-ink-500 hover:bg-ink-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-display text-sm font-medium text-danger transition hover:bg-danger/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-ink-700/40 p-3">
      <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-ink2">
        {label}
      </p>

      <div className="flex items-center gap-2">
        {accent && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
          />
        )}

        <p className="truncate font-display text-sm font-medium text-mist">
          {value}
        </p>
      </div>
    </div>
  );
}