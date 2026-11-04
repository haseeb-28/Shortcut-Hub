"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail } from "@/domain/entities/password";
import { FloatingInput } from "@/components/FloatingInput";

export default function ForgotPasswordPage() {
  const { requestPasswordRecovery } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      // Always resolves — see requestPasswordRecovery's doc comment.
      // The UI below shows the same message whether or not this email
      // matched an account, on purpose (never reveal account existence).
      await requestPasswordRecovery(email);
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="neu-surface w-full max-w-sm rounded-2xl border p-7"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber text-button">
            <Image
              src="/shortcut-hub-logo.png"
              alt="Shortcut Hub"
              width={24}
              height={24}
              priority
              className="h-6 w-6 object-contain invert"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))",
              }}
            />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-mist">Shortcut Hub</p>
            <p className="font-mono text-[11px] text-ink2">password recovery</p>
          </div>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            role="status"
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <CheckCircle2 className="h-9 w-9 text-teal" />
            <div>
              <p className="font-display text-sm font-semibold text-mist">Check your inbox</p>
              <p className="mt-1.5 font-body text-sm text-ink2">
                If an account exists for <span className="text-mist">{email}</span>, a password
                recovery email has been sent.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 flex items-center gap-1.5 font-display text-sm text-amber transition hover:text-amber-soft"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="font-display text-lg font-semibold text-mist">Forgot password</h1>
            <p className="mt-1 font-body text-sm text-ink2">
              Enter the email associated with your account and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
              <FloatingInput
                id="forgot-email"
                label="Email"
                type="email"
                autoFocus
                value={email}
                error={fieldError}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
              />

              <button
                type="submit"
                disabled={submitting}
                className="neu-button flex items-center justify-center gap-2 rounded-lg bg-amber py-2.5 font-display text-sm font-semibold text-button transition hover:bg-amber-soft disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-5 flex items-center justify-center gap-1.5 font-mono text-xs text-ink2 transition hover:text-mist"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </>
        )}

        <p className="mt-5 text-center font-mono text-xs text-ink2">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-amber transition hover:text-amber-soft"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}