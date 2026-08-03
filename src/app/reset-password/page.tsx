"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  PasswordValidationError,
  validatePassword,
  validatePasswordsMatch,
} from "@/domain/entities/password";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-xl border border-border bg-ink-800 p-7 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber text-ink-900">
            <Radio className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-mist">Shortcut Hub</p>
            <p className="font-mono text-[11px] text-ink2">reset your password</p>
          </div>
        </div>

        {/* useSearchParams needs a Suspense boundary — isolated here so the
            header above still renders instantly without waiting on it. */}
        <Suspense fallback={<CenteredSpinner />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </main>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { confirmPasswordRecovery } = useAuth();

  const userId = params.get("userId");
  const secret = params.get("secret");
  const linkPresent = Boolean(userId && secret);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(!linkPresent);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/login"), 2500);
    return () => clearTimeout(timer);
  }, [success, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    try {
      validatePassword(password);
      validatePasswordsMatch(password, confirmPassword);
    } catch (err) {
      if (err instanceof PasswordValidationError) {
        const field = err.message.toLowerCase().includes("match") ? "confirm" : "password";
        setFieldErrors({ [field]: err.message });
      }
      return;
    }

    if (!userId || !secret) {
      setLinkInvalid(true);
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordRecovery(userId, secret, password);
      setSuccess(true);
    } catch {
      // Appwrite rejects expired, reused, or tampered recovery secrets the
      // same way — treated as "link no longer valid" rather than parsing
      // the specific error, so nothing about the failure reason leaks.
      setLinkInvalid(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (linkInvalid) return <InvalidLinkView />;
  if (success) return <SuccessView />;

  return (
    <>
      <h1 className="font-display text-lg font-semibold text-mist">Reset password</h1>
      <p className="mt-1 font-body text-sm text-ink2">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PasswordInput
            id="new-password"
            label="New Password"
            autoFocus
            value={password}
            error={fieldErrors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordInput
          id="confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          error={fieldErrors.confirm}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirm) setFieldErrors((f) => ({ ...f, confirm: undefined }));
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber py-2.5 font-display text-sm font-semibold text-ink-900 transition hover:bg-amber-soft disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}

function InvalidLinkView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      role="alert"
      className="flex flex-col items-center gap-3 py-4 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger/15 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-mist">This link is no longer valid</p>
        <p className="mt-1.5 font-body text-sm text-ink2">
          Recovery links expire after a while and can only be used once. Request a new one to
          keep going.
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="mt-2 rounded-lg bg-amber px-4 py-2 font-display text-sm font-semibold text-ink-900 transition hover:bg-amber-soft"
      >
        Request New Recovery Email
      </Link>
    </motion.div>
  );
}

function SuccessView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      role="status"
      className="flex flex-col items-center gap-3 py-4 text-center"
    >
      <CheckCircle2 className="h-9 w-9 text-teal" />
      <div>
        <p className="font-display text-sm font-semibold text-mist">Password Updated Successfully</p>
        <p className="mt-1.5 font-body text-sm text-ink2">Redirecting you to sign in…</p>
      </div>
    </motion.div>
  );
}

function CenteredSpinner() {
  return (
    <div className="flex justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-ink2" />
    </div>
  );
}