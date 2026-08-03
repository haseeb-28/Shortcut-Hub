"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORIES, type Category } from "@/domain/entities/shortcut";
import { CATEGORY_STYLE, cn } from "@/lib/utils";

interface Props {
  value: Category;
  onChange: (category: Category) => void;
  label?: string;
}

export function CategorySelect({ value, onChange, label = "Category" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const style = CATEGORY_STYLE[value];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink2">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between rounded-lg border border-border bg-ink-700 px-3 py-2.5 text-left text-sm text-mist outline-none transition-colors focus:border-amber/60"
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.accent }} />
          {value}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink2 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-10 mt-1.5 max-h-56 overflow-auto rounded-lg border border-border bg-ink-800 p-1 shadow-2xl"
          >
            {CATEGORIES.map((category) => {
              const optionStyle = CATEGORY_STYLE[category];
              const selected = category === value;
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
                      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left font-mono text-xs transition-colors",
                      selected ? "bg-ink-600 text-mist" : "text-ink2 hover:bg-ink-700 hover:text-mist"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: optionStyle.accent }} />
                      {category}
                    </span>
                    {selected && <Check className="h-3.5 w-3.5 text-amber" />}
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
