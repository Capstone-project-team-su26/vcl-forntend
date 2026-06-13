"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  createSessionFromAuthResponse,
  getSession,
  setSession,
} from "@/shared/services/authSession";
import * as authService from "@/shared/services/authService";
import { getErrorMessage } from "@/shared/utils/apiError";
import { getHomeRouteByRole, isAdminRole } from "@/shared/utils/routing";

export function useAuth() {
  const router = useRouter();
  const [session, setSessionState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setIsReady(true);
  }, []);

  const loginWithCredentials = useCallback(
    async ({ email, password }) => {
      const auth = await authService.login({ email, password });
      const nextSession = createSessionFromAuthResponse(auth, email);
      setSession(nextSession);
      setSessionState(nextSession);
      router.push(getHomeRouteByRole(auth.role));
      return auth;
    },
    [router]
  );

  const saveAuthSession = useCallback((auth, email) => {
    const nextSession = createSessionFromAuthResponse(auth, email);
    setSession(nextSession);
    setSessionState(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    router.push("/login");
  }, [router]);

  return {
    session,
    isLoggedIn: Boolean(session?.token),
    isReady,
    isAdmin: isAdminRole(session?.role),
    loginWithCredentials,
    saveAuthSession,
    logout,
  };
}

export function useAuthErrorMessage(error) {
  return getErrorMessage(error);
}
