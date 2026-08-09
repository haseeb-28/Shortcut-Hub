"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";

import { cn, getCategoryStyle } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

interface Props {
  value: string;
  onChange: (category: string) => void;
  label?: string;
}

export function CategorySelect({
  value,
  onChange,
  label = "Category",
}: Props) {
  const { categories, addCategory } = useCategories();

  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedStyle = getCategoryStyle(value);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function createCategory() {
    const trimmed = newCategory.trim();

    if (!trimmed || creating) {
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      const existingCategory = categories.find(
        (category) =>
          category.toLowerCase() === trimmed.toLowerCase()
      );

      onChange(existingCategory ?? trimmed);
      setNewCategory("");
      setOpen(false);
      return;
    }

    try {
      setCreating(true);

      await addCategory(trimmed);

      onChange(trimmed);
      setNewCategory("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  function selectCategory(category: string) {
    onChange(category);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Label */}
      <div className="mb-2 flex items-center justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink2">
          {label}
        </label>

        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="open"
              initial={{
                opacity: 0,
                x: 5,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 5,
              }}
              className="font-mono text-[9px] text-amber"
            >
              Select category
            </motion.span>
          ) : (
            <motion.span
              key="closed"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="font-mono text-[9px] text-ink2/60"
            >
              {categories.length} available
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Select trigger */}
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileTap={{
          scale: 0.985,
        }}
        className={cn(
          "group relative flex w-full items-center justify-between overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
          open
            ? "border-amber/50 bg-ink-600 shadow-[0_0_0_1px_rgba(242,183,5,0.08),0_8px_30px_rgba(0,0,0,0.2)]"
            : "border-border bg-ink-700 hover:border-ink-500 hover:bg-ink-600"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Selected category glow */}
        <motion.span
          className="pointer-events-none absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full blur-2xl"
          animate={{
            opacity: open ? 0.18 : 0.08,
          }}
          style={{
            backgroundColor: selectedStyle.accent,
          }}
          aria-hidden="true"
        />

        <span className="relative flex min-w-0 items-center gap-3">
          {/* Category icon */}
          <motion.span
            animate={{
              scale: open ? 1.05 : 1,
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
            style={{
              backgroundColor: selectedStyle.bg,
              borderColor: `${selectedStyle.accent}30`,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: selectedStyle.accent,
                boxShadow: `0 0 10px ${selectedStyle.accent}70`,
              }}
            />
          </motion.span>

          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-medium text-mist">
              {value}
            </span>

            <span className="block truncate font-mono text-[9px] text-ink2">
              Shortcut category
            </span>
          </span>
        </span>

        <motion.span
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="relative ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-ink2 transition-colors group-hover:text-mist"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -6,
              scale: 0.98,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.7,
            }}
            className="absolute left-0 right-0 top-full z-[10000] mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111a2e]/[0.98] shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            {/* Top accent */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber/10">
                  <Sparkles className="h-3.5 w-3.5 text-amber" />
                </div>

                <div>
                  <p className="font-display text-xs font-semibold text-mist">
                    Categories
                  </p>

                  <p className="font-mono text-[8px] text-ink2">
                    Choose where this shortcut belongs
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-ink2">
                {categories.length}
              </span>
            </div>

            {/* Category list */}
            <div
              className="custom-scrollbar max-h-60 overflow-y-auto p-2"
              role="listbox"
              aria-label="Categories"
            >
              {categories.map((category, index) => {
                const selected = category === value;
                const optionStyle = getCategoryStyle(category);

                return (
                  <motion.button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectCategory(category)}
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: Math.min(index * 0.025, 0.2),
                    }}
                    whileHover={{
                      x: 2,
                    }}
                    className={cn(
                      "group relative mb-1 flex w-full items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-150 last:mb-0",
                      selected
                        ? "text-mist"
                        : "text-ink2 hover:bg-white/[0.04] hover:text-mist"
                    )}
                  >
                    {/* Selected background */}
                    {selected && (
                      <motion.div
                        layoutId="selected-category-bg"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          backgroundColor: optionStyle.bg,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Left accent */}
                    <motion.span
                      className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                      animate={{
                        opacity: selected ? 1 : 0,
                        scaleY: selected ? 1 : 0.5,
                      }}
                      style={{
                        backgroundColor: optionStyle.accent,
                        boxShadow: selected
                          ? `0 0 10px ${optionStyle.accent}`
                          : "none",
                      }}
                      aria-hidden="true"
                    />

                    <span className="relative flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          backgroundColor: optionStyle.bg,
                          borderColor: `${optionStyle.accent}25`,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: optionStyle.accent,
                            boxShadow: `0 0 8px ${optionStyle.accent}60`,
                          }}
                        />
                      </span>

                      <span className="truncate font-display text-xs font-medium">
                        {category}
                      </span>
                    </span>

                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                          className="relative flex h-6 w-6 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: optionStyle.bg,
                          }}
                        >
                          <Check
                            className="h-3.5 w-3.5"
                            style={{
                              color: optionStyle.accent,
                            }}
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Create category */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Plus className="h-3 w-3 text-amber" />

                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink2">
                  Create category
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void createCategory();
                    }

                    if (event.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  placeholder="e.g. Productivity"
                  maxLength={50}
                  className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 font-body text-xs text-mist outline-none placeholder:text-ink2/60 transition-all duration-200 focus:border-amber/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber/10"
                />

                <motion.button
                  type="button"
                  onClick={() => void createCategory()}
                  disabled={!newCategory.trim() || creating}
                  whileHover={
                    !creating
                      ? {
                          scale: 1.03,
                        }
                      : undefined
                  }
                  whileTap={
                    !creating
                      ? {
                          scale: 0.95,
                        }
                      : undefined
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber text-ink-900 shadow-[0_6px_20px_rgba(242,183,5,0.15)] transition hover:bg-amber-soft disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Create category"
                >
                  {creating ? (
                    <motion.span
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 rounded-full border-2 border-ink-900/30 border-t-ink-900"
                    />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}