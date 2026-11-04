"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ResendVerificationEmail } from "@/components/ResendVerificationEmail";

export default function VerificationPendingPage() {
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
            <p className="font-mono text-[11px] text-ink2">verify your email</p>
          </div>
        </div>
        <Suspense fallback={<VerificationLoading />}>
          <PendingContent />
        </Suspense>
      </motion.div>
    </main>
  );
}

function PendingContent() {
  const { user, ready } = useAuth();
  const searchParams = useSearchParams();
  const email = user?.email;
  const emailStatus = searchParams.get("emailSent");
  const emailSent = emailStatus === "1";
  const emailSendFailed = emailStatus === "0";

  if (!ready) return <VerificationLoading />;

  if (user?.emailVerified) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-teal" />
        <div>
          <h1 className="font-display text-lg font-semibold text-mist">Email verified</h1>
          <p className="mt-1.5 font-body text-sm text-ink2">
            Your account is ready. Sign in to continue to Shortcut Hub.
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
    <div className="flex flex-col items-center gap-4 py-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-amber">
        <MailCheck className="h-6 w-6" />
      </div>
      <div>
        <h1 className="font-display text-lg font-semibold text-mist">
          {emailSent
            ? "Verification request accepted"
            : emailSendFailed
              ? "Verification email not sent"
              : "Verify your email"}
        </h1>
        <p className="mt-1.5 font-body text-sm text-ink2">
          {emailSent ? (
            <>
              Appwrite accepted a verification email request for{" "}
              {email ? <span className="break-all text-mist">{email}</span> : "your email address"}.
              Delivery can take a few minutes. Check your inbox and spam folder, then open the
              link to verify your account before signing in.
            </>
          ) : emailSendFailed ? (
            <>
              Your account was created, but we couldn&apos;t send the verification link.
              Check the Appwrite email-delivery settings, then request another email below.
            </>
          ) : (
            <>
              Check your inbox for a verification link
              {email ? <> sent to <span className="break-all text-mist">{email}</span></> : ""}.
              Open it to verify your account. If you can&apos;t find it, request another email below.
            </>
          )}
        </p>
      </div>

      {user ? (
        <ResendVerificationEmail />
      ) : (
        <p className="font-body text-xs text-ink2">
          Sign in to request another verification email.
        </p>
      )}

      <Link
        href="/login"
        className="mt-1 font-mono text-xs text-ink2 transition hover:text-amber"
      >
        Return to sign in
      </Link>
    </div>
  );
}

function VerificationLoading() {
  return (
    <div className="flex justify-center py-8" role="status" aria-label="Loading">
      <Loader2 className="h-5 w-5 animate-spin text-ink2" />
    </div>
  );
}
