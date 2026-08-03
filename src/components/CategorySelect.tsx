"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Plus,
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
  const {
    categories,
    addCategory,
  } = useCategories();

  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] =
    useState("");

  const rootRef =
    useRef<HTMLDivElement>(null);

  const style = getCategoryStyle(value);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      outside
    );

    document.addEventListener(
      "keydown",
      esc
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        outside
      );

      document.removeEventListener(
        "keydown",
        esc
      );
    };
  }, []);

  async function createCategory() {
    const trimmed =
      newCategory.trim();

    if (!trimmed) return;

    await addCategory(trimmed);

    onChange(trimmed);

    setNewCategory("");

    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col gap-2"
    >
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink2">
        {label}
      </span>

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="flex items-center justify-between rounded-lg border border-border bg-ink-700 px-3 py-2.5 text-sm text-mist transition focus:border-amber/60"
      >
        <span className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                style.accent,
            }}
          />

          {value}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 transition",
            open &&
              "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.15,
            }}
            className="absolute left-0 right-0 top-full z-[9999] mt-2 rounded-xl border border-border bg-ink-800 shadow-2xl"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              {categories.map(
                (category) => {
                  const selected =
                    category ===
                    value;

                  const optionStyle =
                    getCategoryStyle(
                      category
                    );

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onChange(
                          category
                        );

                        setOpen(
                          false
                        );
                      }}
                      className={cn(
                        "mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",

                        selected
                          ? "bg-ink-600 text-mist"
                          : "hover:bg-ink-700 text-ink2 hover:text-mist"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              optionStyle.accent,
                          }}
                        />

                        {category}
                      </span>

                      {selected && (
                        <Check className="h-4 w-4 text-amber" />
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <div className="border-t border-border p-2">
              <div className="flex gap-2">
                <input
                  value={
                    newCategory
                  }
                  onChange={(e) =>
                    setNewCategory(
                      e.target.value
                    )
                  }
                  onKeyDown={(
                    e
                  ) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();

                      createCategory();
                    }
                  }}
                  placeholder="New category..."
                  className="flex-1 rounded-lg border border-border bg-ink-700 px-3 py-2 text-sm text-mist outline-none"
                />

                <button
                  type="button"
                  onClick={
                    createCategory
                  }
                  className="rounded-lg bg-amber px-3 text-ink-900 hover:bg-amber-soft"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}