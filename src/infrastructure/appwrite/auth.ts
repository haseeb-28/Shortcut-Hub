import { ID, OAuthProvider } from "appwrite";
import { account } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
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
   * Register a new account and immediately sign the user in.
   */
  async registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser> {
    const normalizedEmail = email.trim();
    const normalizedName = name.trim();

    await account.create(
      ID.unique(),
      normalizedEmail,
      password,
      normalizedName
    );

    return this.loginWithEmail(normalizedEmail, password);
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
}

export const authService = new AppwriteAuthService();
