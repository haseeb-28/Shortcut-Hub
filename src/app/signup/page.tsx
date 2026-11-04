"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  isValidEmail,
  PasswordValidationError,
  validatePassword,
  validatePasswordsMatch,
} from "@/domain/entities/password";
import { FloatingInput } from "@/components/FloatingInput";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { beginNavigation } from "@/lib/navigation";
import {
  getRegistrationErrorMessage,
  RegistrationError,
  type RegistrationFailureStage,
} from "@/infrastructure/appwrite/auth";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { register, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [registrationStage, setRegistrationStage] =
    useState<RegistrationFailureStage | null>(null);
  const [sessionConflict, setSessionConflict] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setError(null);
    setRegistrationStage(null);
    setSessionConflict(false);

    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

    try {
      validatePassword(password);
    } catch (validationError) {
      if (validationError instanceof PasswordValidationError) {
        errors.password = validationError.message;
      } else {
        throw validationError;
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else {
      try {
        validatePasswordsMatch(password, confirmPassword);
      } catch (validationError) {
        if (validationError instanceof PasswordValidationError) {
          errors.confirmPassword = validationError.message;
        } else {
          throw validationError;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const emailSent = await register(email, password, name);
      beginNavigation();
      router.push(`/verification-pending?emailSent=${emailSent ? "1" : "0"}`);
    } catch (registrationError) {
      setSessionConflict(
        (registrationError instanceof RegistrationError &&
          registrationError.stage === "active-session") ||
          (registrationError instanceof RegistrationError &&
            registrationError.appwriteError?.type === "user_session_already_exists")
      );
      if (registrationError instanceof RegistrationError) {
        setAccountCreated(registrationError.accountCreated);
        setRegistrationStage(registrationError.stage);
        if (process.env.NODE_ENV === "development") {
          console.error("Appwrite sign-up operation failed", {
            stage: registrationError.stage,
            type: registrationError.appwriteError?.type,
            code: registrationError.appwriteError?.code,
            message: registrationError.appwriteError?.message,
          });
        }
        setError(getRegistrationErrorMessage(registrationError));
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      setSessionConflict(false);
      if (accountCreated) {
        setRegistrationStage("session");
      } else {
        setError(null);
      }
    } catch {
      setError("Unable to sign out of the current session. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

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
            <p className="font-mono text-[11px] text-ink2">create your account</p>
          </div>
        </div>

        <h1 className="font-display text-lg font-semibold text-mist">Sign up</h1>
        <p className="mt-1 font-body text-sm text-ink2">
          Create an account to get started with your personal launchpad.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <FloatingInput
            id="signup-name"
            label="Name"
            type="text"
            autoComplete="name"
            autoFocus
            value={name}
            error={fieldErrors.name}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }));
            }}
          />

          <FloatingInput
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={fieldErrors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
          />

          <div className="flex flex-col gap-2">
            <PasswordInput
              id="signup-password"
              label="Password"
              autoComplete="new-password"
              value={password}
              error={fieldErrors.password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }
              }}
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
              }
            }}
          />

          {error && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
              <p className="font-mono text-xs leading-relaxed text-danger">{error}</p>
              {accountCreated && (
                registrationStage === "verification" ? (
                  <Link
                    href="/verification-pending?emailSent=0"
                    className="mt-2 inline-block font-mono text-xs text-amber transition hover:text-amber-soft"
                  >
                    Continue to verification options
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="mt-2 inline-block font-mono text-xs text-amber transition hover:text-amber-soft"
                  >
                    Sign in to your existing account
                  </Link>
                )
              )}
              {sessionConflict && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="mt-2 block font-mono text-xs text-amber transition hover:text-amber-soft disabled:opacity-60"
                >
                  {signingOut ? "Signing out…" : "Sign out of the current session"}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || accountCreated}
            className="neu-button mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber py-2.5 font-display text-sm font-semibold text-button transition hover:bg-amber-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {submitting
              ? "Creating account…"
              : accountCreated
                ? "Account created"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center font-mono text-xs text-ink2">
          Already have an account?{" "}
          <Link href="/login" className="text-amber transition hover:text-amber-soft">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
