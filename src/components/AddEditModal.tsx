"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
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
    if (open) {
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
    }
  }, [open, editing]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function validateField(field: keyof NewShortcut, value: string) {
    if (field === "name" && !value.trim()) {
      setFieldErrors((f) => ({
        ...f,
        name: "Name is required.",
      }));
    } else if (field === "url" && !isValidUrl(value)) {
      setFieldErrors((f) => ({
        ...f,
        url: "Enter a valid URL.",
      }));
    }
  }

  function clearFieldError(field: keyof NewShortcut) {
    setFieldErrors((f) => ({
      ...f,
      [field]: undefined,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      await onSubmit(form);

      setSuccess(true);

      setTimeout(onClose, 550);
    } catch (err) {
      if (err instanceof ShortcutValidationError) {
        setFieldErrors({
          [err.field]: err.message,
        });
      } else {
        setFormError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
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
          onClick={onClose}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-900/70 p-4 backdrop-blur-sm"
        >
          <div className="flex min-h-full items-center justify-center py-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-visible rounded-xl border border-border bg-ink-800 p-6 shadow-2xl"
            >
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-ink-800"
                  >
                    <motion.div
                      initial={{
                        scale: 0.5,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-teal" />
                    </motion.div>

                    <p className="font-display text-sm font-semibold text-mist">
                      {editing
                        ? "Changes saved"
                        : "Shortcut added"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-mist">
                  {editing
                    ? "Edit Shortcut"
                    : "Add Shortcut"}
                </h2>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1 text-ink2 transition hover:bg-ink-600 hover:text-mist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                <FloatingInput
                  id="shortcut-name"
                  label="Name"
                  autoFocus
                  value={form.name}
                  error={fieldErrors.name}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }));

                    if (fieldErrors.name) {
                      clearFieldError("name");
                    }
                  }}
                  onBlur={(e) =>
                    validateField("name", e.target.value)
                  }
                />

                <FloatingInput
                  id="shortcut-url"
                  label="URL"
                  mono
                  value={form.url}
                  error={fieldErrors.url}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      url: e.target.value,
                    }));

                    if (fieldErrors.url) {
                      clearFieldError("url");
                    }
                  }}
                  onBlur={(e) =>
                    validateField("url", e.target.value)
                  }
                />

                <CategorySelect
                  value={form.category}
                  onChange={(category) =>
                    setForm((f) => ({
                      ...f,
                      category,
                    }))
                  }
                />

                {formError && (
                  <p className="text-xs text-danger">
                    {formError}
                  </p>
                )}

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-lg px-4 py-2 text-sm text-ink2 transition hover:text-mist disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-amber-soft disabled:opacity-70"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {submitting
                      ? "Saving..."
                      : editing
                      ? "Save Changes"
                      : "Add Shortcut"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}