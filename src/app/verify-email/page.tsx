"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
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
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}
            />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-mist">Shortcut Hub</p>
            <p className="font-mono text-[11px] text-ink2">email verification</p>
          </div>
        </div>
        <Suspense fallback={<VerificationResult state="loading" />}>
          <VerificationContent />
        </Suspense>
      </motion.div>
    </main>
  );
}

function VerificationContent() {
  const params = useSearchParams();
  const { verifyEmail } = useAuth();
  const [state, setState] = useState<VerificationState>("loading");
  const started = useRef(false);
  const userId = params.get("userId");
  const secret = params.get("secret");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!userId || !secret) {
      setState("error");
      return;
    }

    verifyEmail(userId, secret)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [userId, secret, verifyEmail]);

  return <VerificationResult state={state} />;
}

function VerificationResult({ state }: { state: VerificationState }) {
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-amber" />
        <p className="font-body text-sm text-ink2">Verifying your email…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-teal" />
        <div>
          <h1 className="font-display text-lg font-semibold text-mist">Email verified</h1>
          <p className="mt-1.5 font-body text-sm text-ink2">
            Your email address is confirmed. You can now sign in to your account.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 rounded-lg bg-amber px-4 py-2.5 font-display text-sm font-semibold text-button transition hover:bg-amber-soft"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-3 text-center">
      <AlertTriangle className="h-10 w-10 text-danger" />
      <div>
        <h1 className="font-display text-lg font-semibold text-mist">
          This verification link can&apos;t be used
        </h1>
        <p className="mt-1.5 font-body text-sm text-ink2">
          It may be invalid, expired, or already used. Request a new verification email to try again.
        </p>
      </div>
      <Link
        href="/verification-pending"
        className="mt-2 flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 font-display text-sm font-semibold text-button transition hover:bg-amber-soft"
      >
        <MailCheck className="h-4 w-4" />
        Request a new link
      </Link>
    </div>
  );
}
