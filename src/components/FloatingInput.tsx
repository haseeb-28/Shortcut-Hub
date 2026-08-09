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
export const FloatingInput = forwardRef<HTMLInputElement, Props>(
  function FloatingInput(
    { label, error, mono, id, className, value, defaultValue, ...props },
    ref
  ) {
    const hasValue =
      value !== undefined
        ? String(value).length > 0
        : defaultValue !== undefined &&
          String(defaultValue).length > 0;

    return (
      <div className="relative">
        <div className="relative">
          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "peer w-full rounded-xl border bg-ink-700/60 px-4 pb-3 pt-5",
              "font-body text-sm text-mist outline-none",
              "placeholder:text-transparent",
              "transition-all duration-200",
              "border-border",
              "hover:border-ink-500",
              "focus:border-amber/60 focus:bg-ink-700/80",
              "focus:ring-1 focus:ring-amber/20",
              error &&
                "border-danger/50 focus:border-danger/60 focus:ring-danger/10",
              mono && "font-mono text-xs",
              className
            )}
            {...props}
          />

          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 z-10",
              "-translate-y-1/2 origin-left",
              "font-body text-sm text-ink2",
              "transition-all duration-200 ease-out",
              "peer-focus:top-2.5 peer-focus:translate-y-0",
              "peer-focus:scale-[0.82] peer-focus:text-amber",
              hasValue &&
                "top-2.5 translate-y-0 scale-[0.82] text-ink2",
              mono && "font-mono text-xs"
            )}
          >
            {label}
          </label>

          <motion.div
            initial={false}
            animate={{
              opacity: error ? 1 : 0,
              scaleX: error ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center bg-danger"
          />
        </div>

        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              id={id ? `${id}-error` : undefined}
              initial={{
                opacity: 0,
                height: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -4,
              }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden pt-1.5 pl-1 font-body text-[11px] text-danger"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";