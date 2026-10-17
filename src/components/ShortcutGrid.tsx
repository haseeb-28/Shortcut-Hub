"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";

import { ShortcutCard } from "./ShortcutCard";
import { EmptyState } from "./EmptyState";

interface Props {
  shortcuts: ShortcutViewModel[];
  hasAnyShortcuts: boolean;
  onEdit: (shortcut: ShortcutViewModel) => void;
  onDelete: (shortcut: ShortcutViewModel) => void;
  onPreview: (shortcut: ShortcutViewModel) => void;
  onAdd: () => void;
  /** Active search term, passed through for match highlighting. */
  query?: string;
}

export function ShortcutGrid({
  shortcuts,
  hasAnyShortcuts,
  onEdit,
  onDelete,
  onPreview,
  onAdd,
  query,
}: Props) {
  if (shortcuts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <EmptyState
          variant={hasAnyShortcuts ? "no-results" : "first-run"}
          onAdd={onAdd}
        />
      </motion.div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="relative"
      aria-label="Shortcut library"
    >
      {/* Ambient grid glow */}
      <div
        className="pointer-events-none absolute -inset-x-8 -top-8 -z-10 h-40 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-amber), transparent 65%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.035,
              delayChildren: 0.03,
            },
          },
        }}
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={shortcut.id}
              layout
              variants={{
                hidden: {
                  opacity: 0,
                  y: 18,
                  scale: 0.96,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: -10,
                transition: {
                  duration: 0.2,
                  ease: "easeIn",
                },
              }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                },
              }}
              className="min-w-0"
            >
              <ShortcutCard
                shortcut={shortcut}
                index={index}
                query={query}
                onEdit={() => onEdit(shortcut)}
                onDelete={() => onDelete(shortcut)}
                onPreview={() => onPreview(shortcut)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}