import { ID, OAuthProvider } from "appwrite";
import { account } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Thin adapter around Appwrite's Account API. Presentation code (useAuth)
 * talks to this, never to the Appwrite SDK directly, so the auth provider
 * stays swappable the same way the database repository is.
 */
export class AppwriteAuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();
      return { id: user.$id, email: user.email, name: user.name };
    } catch {
      // No active session — this is a normal, expected state, not an error.
      return null;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    await account.createEmailPasswordSession(email, password);
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Signed in, but couldn't load the account.");
    return user;
  }

  /**
   * Full-page redirect flow: the browser leaves the app, the person
   * authenticates with Google, and Appwrite redirects back to `successUrl`
   * (or `failureUrl`) with a session already created. There is no token to
   * handle here — `useAuth`'s existing `getCurrentUser()` check on mount is
   * what picks the new session up once the browser lands back on the app.
   *
   * Requires the Google provider to be enabled first in the Appwrite
   * console (Auth → Settings → Auth methods → Google) with a Google OAuth
   * client ID/secret — see README.md FAQ "Can I add Google Login?".
   */
  loginWithGoogle(redirectPath: string = "/"): void {
    const origin = window.location.origin;
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${origin}${redirectPath}`,
      `${origin}/login?error=oauth`
    );
  }

  async registerWithEmail(email: string, password: string, name: string): Promise<AuthUser> {
    await account.create(ID.unique(), email, password, name);
    return this.loginWithEmail(email, password);
  }

  async logout(): Promise<void> {
    await account.deleteSession("current");
  }

  /**
   * Kicks off Appwrite's native recovery flow: Appwrite emails the user a
   * link to `${redirectUrl}?userId=...&secret=...` (it appends those two
   * params itself). There's no custom token system here — Appwrite issues
   * and validates the secret entirely on its side.
   *
   * Deliberately swallows "user not found"-style failures rather than
   * surfacing them: the calling page always shows the same generic message
   * regardless of whether the email matched an account, so this app never
   * reveals account existence through timing or error content.
   */
  async requestPasswordRecovery(email: string, redirectUrl: string): Promise<void> {
    try {
      await account.createRecovery(email, redirectUrl);
    } catch {
      // Intentionally silent — see doc comment above.
    }
  }

  /**
   * Completes the recovery flow using the `userId`/`secret` pair from the
   * link Appwrite emailed. Appwrite validates the secret itself (including
   * expiry and single-use) — an invalid/expired/reused link surfaces as a
   * thrown error here, which the reset-password page maps to its
   * "recovery link is no longer valid" UI.
   */
  async confirmPasswordRecovery(userId: string, secret: string, newPassword: string): Promise<void> {
    await account.updateRecovery(userId, secret, newPassword);
  }
}

export const authService = new AppwriteAuthService();