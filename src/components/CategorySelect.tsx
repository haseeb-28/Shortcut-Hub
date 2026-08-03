"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import {
  CATEGORIES,
  type Category,
} from "@/domain/entities/shortcut";
import {
  CATEGORY_STYLE,
  cn,
} from "@/lib/utils";

interface Props {
  value: Category;
  onChange: (category: Category) => void;
  label?: string;
}

export function CategorySelect({
  value,
  onChange,
  label = "Category",
}: Props) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const style = CATEGORY_STYLE[value];

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
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col gap-2 overflow-visible"
    >
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink2">
        {label}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between rounded-lg border border-border bg-ink-700 px-3 py-2.5 text-left text-sm text-mist transition-all duration-200 hover:border-amber/60 focus:border-amber/60 focus:outline-none"
      >
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: style.accent,
            }}
          />

          {value}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink2 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
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
              duration: 0.18,
            }}
            className="
              absolute
              left-0
              right-0
              top-full
              mt-2
              z-[99999]
              max-h-80
              overflow-y-auto
              rounded-xl
              border
              border-border
              bg-ink-800
              p-2
              shadow-2xl
              ring-1
              ring-black/30
              custom-scrollbar
            "
          >
            {CATEGORIES.map((category) => {
              const optionStyle =
                CATEGORY_STYLE[category];

              const selected =
                category === value;

              return (
                <li key={category}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(category);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                      selected
                        ? "bg-ink-600 text-mist"
                        : "text-ink2 hover:bg-ink-700 hover:text-mist"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
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
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}