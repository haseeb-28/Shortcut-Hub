"use client";

import { useCallback, useEffect, useState } from "react";
import { authService, type AuthUser } from "@/infrastructure/appwrite/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    const current = await authService.getCurrentUser();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setReady(true));
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedIn = await authService.loginWithEmail(email, password);
      setUser(loggedIn);
    },
    []
  );

  /** Redirects the browser away — there is nothing to await here on success. */
  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle("/");
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  /** Always resolves — the calling page shows the same message regardless of outcome, so account existence is never revealed. */
  const requestPasswordRecovery = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    await authService.requestPasswordRecovery(email, redirectUrl);
  }, []);

  /** Throws if the recovery link is invalid, expired, or already used — the reset-password page catches this. */
  const confirmPasswordRecovery = useCallback(
    async (userId: string, secret: string, newPassword: string) => {
      await authService.confirmPasswordRecovery(userId, secret, newPassword);
    },
    []
  );

  return {
    isAuthed: !!user,
    user,
    ready,
    login,
    loginWithGoogle,
    logout,
    requestPasswordRecovery,
    confirmPasswordRecovery,
  };
}