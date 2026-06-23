"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  createSessionFromAuthResponse,
  getSession,
  setSession,
  syncAuthCookies,
} from "@/utils/authSession";
import * as authService from "@/utils/authService";
import { getErrorMessage } from "@/utils/apiError";
import { getHomeRouteByRole, isAdminRole, isSaleRole, isStaffRole } from "@/utils/routing";
import { resolvePostLoginPath } from "@/utils/routeAccess";

export function useAuth() {
  const router = useRouter();
  const [session, setSessionState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const current = getSession();
    syncAuthCookies(current);
    setSessionState(current);
    setIsReady(true);
  }, []);

  const loginWithCredentials = useCallback(
    async ({ email, password, redirectTo } = {}) => {
      const auth = await authService.login({ email, password });
      const nextSession = createSessionFromAuthResponse(auth, email);
      setSession(nextSession);
      setSessionState(nextSession);
      router.push(resolvePostLoginPath(auth.role, redirectTo));
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
    isStaff: isStaffRole(session?.role),
    isSale: isSaleRole(session?.role),
    loginWithCredentials,
    saveAuthSession,
    logout,
  };
}

export function useAuthErrorMessage(error) {
  return getErrorMessage(error);
}
