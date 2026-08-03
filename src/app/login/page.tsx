"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome, Loader2, LogIn, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FloatingInput } from "@/components/FloatingInput";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Couldn't sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    // This redirects the whole page away — the "loading" state just
    // prevents a double-click while that navigation kicks off.
    loginWithGoogle();
  }

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
            <p className="font-mono text-[11px] text-ink2">sign in to your launchpad</p>
          </div>
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="-mt-2 text-right">
            <Link href="/forgot-password" className="font-mono text-[11px] text-ink2 transition hover:text-amber">
              Forgot password?
            </Link>
          </motion.div>

          {error && <p className="font-body text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber py-2.5 font-display text-sm font-semibold text-ink-900 transition hover:bg-amber-soft disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink2">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-ink-700 py-2.5 font-display text-sm font-medium text-mist transition hover:border-ink-500 hover:bg-ink-600 disabled:opacity-60"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
          Continue with Google
        </button>
      </motion.div>
    </main>
  );
}

/**
 * Reads `?error=oauth`, which `loginWithGoogle`'s failureUrl redirects back
 * to if the Google sign-in attempt fails or is cancelled. Split into its own
 * component so only this part needs the useSearchParams Suspense boundary
 * Next.js requires — the rest of the page stays statically rendered.
 */
function OAuthErrorBanner() {
  const params = useSearchParams();
  if (params.get("error") !== "oauth") return null;

  return (
    <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-body text-xs text-danger">
      Google sign-in didn't go through. Please try again, or sign in with email and password.
    </div>
  );
}