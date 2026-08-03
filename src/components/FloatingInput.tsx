"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  mono?: boolean;
}

/**
 * Floating label: renders as inline placeholder text until the field is
 * focused or filled, then floats up above the input. Reused by the
 * add/edit shortcut form and the login form for a consistent form language.
 */
export const FloatingInput = forwardRef<HTMLInputElement, Props>(function FloatingInput(
  { label, error, mono, id, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          className={cn(
            "peer w-full rounded-lg border bg-ink-700 px-3 pb-2 pt-5 text-sm text-mist outline-none transition-colors",
            mono ? "font-mono" : "font-body",
            error ? "border-danger/60 focus:border-danger" : "border-border focus:border-amber/60",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 top-4 -translate-y-1/2 font-mono text-xs uppercase tracking-wide text-ink2 transition-all",
            "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:text-amber",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px]",
            error && "peer-focus:text-danger"
          )}
        >
          {label}
        </label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="font-body text-xs text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
