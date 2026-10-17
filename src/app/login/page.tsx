"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FloatingInput } from "@/components/FloatingInput";
import { beginNavigation } from "@/lib/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      beginNavigation();
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    beginNavigation();
    loginWithGoogle();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="neu-surface w-full max-w-sm rounded-2xl border p-7"
      >
        <div className="mb-7 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber text-button">
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
          </div>

          <h1 className="font-display text-xl font-semibold text-mist">
            Shortcut Hub
          </h1>

          <p className="mt-1 font-mono text-[11px] text-ink2">
            sign in to your launchpad
          </p>
        </div>

        <Suspense fallback={null}>
          <OAuthErrorBanner />
        </Suspense>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FloatingInput
            id="login-email"
            label="Email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            id="login-password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="-mt-2 text-right"
          >
            <Link
              href="/forgot-password"
              className="font-mono text-[11px] text-ink2 transition hover:text-amber"
            >
              Forgot password?
            </Link>
          </motion.div>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
              <p className="font-mono text-xs leading-relaxed text-danger">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="neu-button mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber py-2.5 font-display text-sm font-semibold text-button transition hover:bg-amber-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}

            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink2">
            or
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="neu-button flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-ink-800 py-2.5 font-display text-sm font-medium text-mist transition hover:border-ink-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4" />
          )}

          Continue with Google
        </button>
      </motion.div>
    </main>
  );
}

/**
 * Reads ?error=oauth, which loginWithGoogle's failure URL
 * uses when Google authentication fails or is cancelled.
 */
function OAuthErrorBanner() {
  const params = useSearchParams();

  if (params.get("error") !== "oauth") {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
      <p className="font-mono text-xs leading-relaxed text-danger">
        Google sign-in didn't go through. Please try again, or sign in
        with email and password.
      </p>
    </div>
  );
}
