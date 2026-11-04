"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MailCheck, Send } from "lucide-react";
import {
  getAppwriteErrorDetails,
  VerificationCooldownError,
  VerificationSessionError,
} from "@/infrastructure/appwrite/auth";
import { useAuth } from "@/hooks/useAuth";

export function ResendVerificationEmail() {
  const {
    resendEmailVerification,
    getVerificationResendCooldownSeconds,
  } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateCooldown = useCallback(() => {
    setCooldown(getVerificationResendCooldownSeconds());
  }, [getVerificationResendCooldownSeconds]);

  useEffect(() => {
    updateCooldown();
  }, [updateCooldown]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(updateCooldown, 1000);
    return () => clearTimeout(timer);
  }, [cooldown, updateCooldown]);

  async function handleResend() {
    setSending(true);
    setMessage(null);
    setError(null);

    try {
      await resendEmailVerification();
      setMessage("Appwrite accepted a new verification email request.");
      updateCooldown();
    } catch (requestError) {
      if (requestError instanceof VerificationCooldownError) {
        setCooldown(requestError.retryAfterSeconds);
        setError(`Please wait ${requestError.retryAfterSeconds} seconds before trying again.`);
        if (process.env.NODE_ENV === "development" && requestError.appwriteError) {
          console.error("Appwrite verification request rejected", requestError.appwriteError);
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          const details = getAppwriteErrorDetails(requestError);
          console.error(
            requestError instanceof VerificationSessionError
              ? "Appwrite verification session check failed; createVerification was not called"
              : "Appwrite verification request failed",
            details
          );
        }
        setError(
          requestError instanceof VerificationSessionError
            ? "Your sign-in session expired. Sign in again before requesting a verification email."
            : "We couldn't send the verification email. Please try again later."
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="neu-button flex items-center justify-center gap-2 rounded-lg border border-border bg-ink-800 px-4 py-2.5 font-display text-sm font-medium text-mist transition hover:border-amber/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : message ? (
          <MailCheck className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {sending
          ? "Sending…"
          : cooldown > 0
            ? `Resend available in ${cooldown}s`
            : "Resend verification email"}
      </button>

      {message && (
        <p role="status" className="text-center font-body text-xs text-teal">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-center font-body text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
