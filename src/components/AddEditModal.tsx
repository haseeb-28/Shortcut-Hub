"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import {
  ShortcutValidationError,
  isValidUrl,
  type NewShortcut,
} from "@/domain/entities/shortcut";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";

import { FloatingInput } from "./FloatingInput";
import { CategorySelect } from "./CategorySelect";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewShortcut) => Promise<void>;
  editing?: ShortcutViewModel | null;
}

const EMPTY: NewShortcut = {
  name: "",
  url: "",
  category: "Other",
};

type FieldErrors = Partial<Record<keyof NewShortcut, string>>;

export function AddEditModal({
  open,
  onClose,
  onSubmit,
  editing,
}: Props) {
  const [form, setForm] = useState<NewShortcut>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;

    setForm(
      editing
        ? {
            name: editing.name,
            url: editing.url,
            category: editing.category,
          }
        : EMPTY
    );

    setFormError(null);
    setFieldErrors({});
    setSuccess(false);
    setSubmitting(false);
  }, [open, editing]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  function validateField(
    field: keyof NewShortcut,
    value: string
  ) {
    if (field === "name") {
      if (!value.trim()) {
        setFieldErrors((current) => ({
          ...current,
          name: "Name is required.",
        }));
      }
    }

    if (field === "url") {
      if (!isValidUrl(value)) {
        setFieldErrors((current) => ({
          ...current,
          url: "Enter a valid URL.",
        }));
      }
    }
  }

  function clearFieldError(field: keyof NewShortcut) {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setFormError(null);

    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!isValidUrl(form.url)) {
      nextErrors.url = "Enter a valid URL.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name.trim(),
        url: form.url.trim(),
        category: form.category,
      });

      setSuccess(true);

      window.setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      if (error instanceof ShortcutValidationError) {
        setFieldErrors({
          [error.field]: error.message,
        });
      } else {
        setFormError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              onClose();
            }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#050914]/80 p-4 backdrop-blur-md"
        >
          {/* Ambient glow */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 0.35,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.7,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute h-80 w-80 rounded-full bg-amber/10 blur-[100px]"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.94,
              rotateX: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
              mass: 0.8,
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative w-full max-w-lg overflow-visible rounded-2xl border border-white/[0.08] bg-[#10182b]/95 shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Top glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-amber/70 to-transparent" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber/[0.06] blur-3xl" />

            {/* Success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-[#10182b]/98 backdrop-blur-xl"
                >
                  <motion.div
                    initial={{
                      scale: 0.4,
                      opacity: 0,
                      rotate: -15,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_40px_rgba(52,211,153,0.15)]"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </motion.div>

                  <motion.h3
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.12,
                    }}
                    className="mt-5 font-display text-lg font-semibold text-mist"
                  >
                    {editing
                      ? "Changes saved"
                      : "Shortcut added"}
                  </motion.h3>

                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.18,
                    }}
                    className="mt-1 font-body text-xs text-ink2"
                  >
                    Your launchpad has been updated.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{
                    scale: 0.7,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.08,
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber/20 bg-amber/10"
                >
                  {editing ? (
                    <Sparkles className="h-4.5 w-4.5 text-amber" />
                  ) : (
                    <Plus className="h-5 w-5 text-amber" />
                  )}
                </motion.div>

                <div>
                  <h2 className="font-display text-lg font-semibold text-mist">
                    {editing
                      ? "Edit Shortcut"
                      : "Add Shortcut"}
                  </h2>

                  <p className="mt-0.5 font-body text-xs text-ink2">
                    {editing
                      ? "Update your saved launchpad shortcut."
                      : "Add a new destination to your launchpad."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
                className="group rounded-xl border border-transparent p-2 text-ink2 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-mist disabled:pointer-events-none disabled:opacity-40"
              >
                <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative flex flex-col gap-5 px-6 py-6"
            >
              {/* Name */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08,
                }}
              >
                <FloatingInput
                  id="shortcut-name"
                  label="Name"
                  autoFocus
                  value={form.name}
                  error={fieldErrors.name}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }));

                    if (fieldErrors.name) {
                      clearFieldError("name");
                    }
                  }}
                  onBlur={(event) =>
                    validateField(
                      "name",
                      event.target.value
                    )
                  }
                />
              </motion.div>

              {/* URL */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.13,
                }}
                className="relative"
              >
                <FloatingInput
                  id="shortcut-url"
                  label="URL"
                  mono
                  value={form.url}
                  error={fieldErrors.url}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }));

                    if (fieldErrors.url) {
                      clearFieldError("url");
                    }
                  }}
                  onBlur={(event) =>
                    validateField(
                      "url",
                      event.target.value
                    )
                  }
                />

                {form.url && isValidUrl(form.url) && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Link2 className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                )}
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.18,
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink2">
                    Category
                  </label>

                  <span className="font-mono text-[9px] text-ink2/70">
                    Choose one
                  </span>
                </div>

                <CategorySelect
                  value={form.category}
                  onChange={(category) =>
                    setForm((current) => ({
                      ...current,
                      category,
                    }))
                  }
                />
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 font-body text-xs text-danger">
                      {formError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.23,
                }}
                className="mt-1 flex items-center justify-end gap-2 border-t border-white/[0.06] pt-5"
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl px-4 py-2.5 font-display text-sm text-ink2 transition-all duration-200 hover:bg-white/[0.04] hover:text-mist disabled:opacity-40"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    !submitting
                      ? {
                          scale: 1.02,
                        }
                      : undefined
                  }
                  whileTap={
                    !submitting
                      ? {
                          scale: 0.97,
                        }
                      : undefined
                  }
                  className="relative flex min-w-[145px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber px-5 py-2.5 font-display text-sm font-semibold text-ink-900 shadow-[0_8px_30px_rgba(242,183,5,0.15)] transition-all duration-200 hover:bg-amber-soft hover:shadow-[0_10px_35px_rgba(242,183,5,0.22)] disabled:pointer-events-none disabled:opacity-60"
                >
                  {!submitting && (
                    <motion.span
                      initial={{
                        x: "-120%",
                      }}
                      animate={{
                        x: "120%",
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                      className="pointer-events-none absolute inset-y-0 w-12 skew-x-[-20deg] bg-white/20 blur-md"
                    />
                  )}

                  {submitting ? (
                    <Loader2 className="relative h-4 w-4 animate-spin" />
                  ) : editing ? (
                    <Sparkles className="relative h-4 w-4" />
                  ) : (
                    <Plus className="relative h-4 w-4" />
                  )}

                  <span className="relative">
                    {submitting
                      ? "Saving..."
                      : editing
                      ? "Save Changes"
                      : "Add Shortcut"}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}