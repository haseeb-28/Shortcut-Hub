import { AppwriteException, ID, OAuthProvider } from "appwrite";
import { account } from "./client";

const VERIFICATION_RESEND_COOLDOWN_MS = 60_000;
let verificationResendAvailableAt = 0;

export interface AppwriteErrorDetails {
  type: string | null;
  code: number | null;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export class VerificationCooldownError extends Error {
  constructor(
    public readonly retryAfterSeconds: number,
    readonly appwriteError: AppwriteErrorDetails | null = null
  ) {
    super("A verification email was requested too recently.");
    this.name = "VerificationCooldownError";
  }
}

export class VerificationSessionError extends Error {
  constructor(readonly appwriteError: AppwriteErrorDetails) {
    super("Could not confirm an active Appwrite session for email verification.");
    this.name = "VerificationSessionError";
  }
}

export function isEmailVerificationRequiredError(error: unknown): boolean {
  return (
    error instanceof AppwriteException &&
    error.type === "user_email_not_verified"
  );
}

export type RegistrationFailureStage =
  | "account"
  | "active-session"
  | "session"
  | "verification-session"
  | "verification";

export function getAppwriteErrorDetails(error: unknown): AppwriteErrorDetails {
  if (error instanceof VerificationCooldownError && error.appwriteError) {
    return error.appwriteError;
  }

  if (error instanceof VerificationSessionError) {
    return error.appwriteError;
  }

  if (error instanceof AppwriteException) {
    return {
      type: error.type || null,
      code: error.code,
      message: error.message,
    };
  }

  return {
    type: null,
    code: null,
    message: error instanceof Error ? error.message : "Unknown error",
  };
}

export class RegistrationError extends Error {
  constructor(
    readonly stage: RegistrationFailureStage,
    readonly appwriteError: AppwriteErrorDetails | null
  ) {
    super("Account registration failed.");
    this.name = "RegistrationError";
  }

  get accountCreated(): boolean {
    return this.stage !== "account" && this.stage !== "active-session";
  }
}

export function getRegistrationErrorMessage(error: unknown): string {
  if (!(error instanceof RegistrationError)) {
    return "Unable to create your account. Please try again.";
  }

  if (error.stage === "active-session") {
    return "A Shortcut Hub account is already signed in in this browser. Sign it out before creating another account. Your current session has not been changed.";
  }

  if (error.stage === "session") {
    if (error.appwriteError?.type === "user_session_already_exists") {
      return "Your account was created, but Appwrite found another active session and rejected sign-in. Sign out of the current session, then sign in to this existing account. Do not create another account.";
    }

    switch (error.appwriteError?.type) {
      case "user_session_limit_reached":
        return "Your account was created, but Appwrite has reached its active-session limit. Sign out of another session, then sign in here and request a verification email.";
      case "user_email_not_verified":
        return "Your account was created, but Appwrite rejected sign-in before a session could be established. Sign in to this existing account after checking the email and password; do not create another account.";
      case "user_blocked":
        return "Your account was created, but sign-in is blocked for this account. Contact the project administrator.";
      default:
        return "Your account was created, but automatic sign-in failed. Sign in to this existing account to continue; do not create another account.";
    }
  }

  if (error.stage === "verification") {
    return "Your account was created and signed in, but Appwrite rejected the verification email request. Continue to verification options to retry; do not create another account.";
  }

  if (error.stage === "verification-session") {
    return "Your account was created, but the active sign-in session could not be confirmed, so no verification email request was made. Sign in to this existing account and request a new link; do not create another account.";
  }

  switch (error.appwriteError?.type) {
    case "user_already_exists":
    case "user_email_already_exists":
      return "An account with this email already exists. Sign in or reset your password.";
    case "user_invalid_email":
      return "Appwrite rejected this email address. Check the address and try again.";
    case "user_password_too_short":
    case "user_invalid_password":
      return "Appwrite rejected this password. Choose a different password and try again.";
    case "user_invalid_name":
      return "Enter a valid name and try again.";
    case "user_email_not_whitelisted":
      return "This email address isn't allowed by the Appwrite project. Check the project's email restrictions.";
    default:
      if (error.appwriteError?.code === 429) {
        return "Too many sign-up attempts. Wait a little and try again.";
      }

      return "Appwrite couldn't create your account. Check your details and try again.";
  }
}

export function registrationError(
  stage: RegistrationFailureStage,
  error: unknown
): RegistrationError {
  return new RegistrationError(stage, getAppwriteErrorDetails(error));
}

/**
 * Thin adapter around Appwrite's Account API.
 *
 * Presentation code talks to this service instead of directly
 * depending on the Appwrite SDK.
 */
export class AppwriteAuthService {
  /**
   * Get the currently authenticated Appwrite user.
   *
   * Returns null when there is no active session.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();

      return {
        id: user.$id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerification,
      };
    } catch {
      // No active session is a normal state.
      return null;
    }
  }

  /**
   * Sign in using email and password.
   */
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<AuthUser> {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    if (!password) {
      throw new Error("Password is required.");
    }

    try {
      await account.createEmailPasswordSession(normalizedEmail, password);

      const user = await this.getCurrentUser();

      if (!user) {
        throw new Error(
          "Signed in successfully, but the account could not be loaded."
        );
      }

      return user;
    } catch (error) {
      /**
       * Keep the original Appwrite error so the login page
       * can show/use the real error while debugging.
       */
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Unable to sign in.");
    }
  }

  /**
   * Sign in with Google through Appwrite OAuth.
   */
  loginWithGoogle(redirectPath: string = "/"): void {
    const origin = window.location.origin;

    account.createOAuth2Session(
      OAuthProvider.Google,
      `${origin}${redirectPath}`,
      `${origin}/login?error=oauth`
    );
  }

  /**
   * Register a new account and create a session so it can request verification.
   */
  async registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser> {
    const normalizedEmail = email.trim();
    const normalizedName = name.trim();

    const activeUser = await this.getCurrentUser();
    if (activeUser) {
      throw new RegistrationError("active-session", null);
    }

    try {
      await account.create(
        ID.unique(),
        normalizedEmail,
        password,
        normalizedName
      );
    } catch (error) {
      throw new RegistrationError(
        "account",
        getAppwriteErrorDetails(error)
      );
    }

    try {
      return await this.loginWithEmail(normalizedEmail, password);
    } catch (error) {
      throw new RegistrationError(
        "session",
        getAppwriteErrorDetails(error)
      );
    }
  }

  /**
   * Delete the current Appwrite session.
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      /**
       * If there is already no session, logging out should
       * still leave the application in the logged-out state.
       */
      if (
        error instanceof Error &&
        !error.message.toLowerCase().includes("session")
      ) {
        throw error;
      }
    }
  }

  /**
   * Start Appwrite's password recovery flow.
   */
  async requestPasswordRecovery(
    email: string,
    redirectUrl: string
  ): Promise<void> {
    try {
      await account.createRecovery(email.trim(), redirectUrl);
    } catch {
      /**
       * Deliberately swallow recovery errors so the application
       * does not reveal whether an email address exists.
       */
    }
  }

  /**
   * Complete Appwrite's password recovery flow.
   */
  async confirmPasswordRecovery(
    userId: string,
    secret: string,
    newPassword: string
  ): Promise<void> {
    await account.updateRecovery(userId, secret, newPassword);
  }

  async sendEmailVerification(redirectUrl: string): Promise<void> {
    const remainingSeconds = this.getVerificationResendCooldownSeconds();
    if (remainingSeconds > 0) {
      throw new VerificationCooldownError(remainingSeconds);
    }

    let user;
    try {
      user = await account.get();
    } catch (error) {
      throw new VerificationSessionError(getAppwriteErrorDetails(error));
    }

    if (user.emailVerification) {
      throw new Error("This email address is already verified.");
    }

    try {
      await account.createVerification(redirectUrl);
      verificationResendAvailableAt = Date.now() + VERIFICATION_RESEND_COOLDOWN_MS;
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 429) {
        verificationResendAvailableAt = Date.now() + VERIFICATION_RESEND_COOLDOWN_MS;
        throw new VerificationCooldownError(
          this.getVerificationResendCooldownSeconds(),
          getAppwriteErrorDetails(error)
        );
      }

      throw error;
    }
  }

  async verifyEmail(userId: string, secret: string): Promise<void> {
    await account.updateVerification(userId, secret);
  }

  getVerificationResendCooldownSeconds(): number {
    return Math.max(
      0,
      Math.ceil((verificationResendAvailableAt - Date.now()) / 1000)
    );
  }
}

export const authService = new AppwriteAuthService();
