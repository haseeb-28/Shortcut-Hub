"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string | null;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { label, error, id, className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          placeholder=" "
          className={cn(
            "peer w-full rounded-lg border bg-ink-700 px-3 pb-2 pr-10 pt-5 text-sm text-mist outline-none transition-colors",
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
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink2 transition hover:text-mist"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
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