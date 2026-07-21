"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  createSessionFromAuthResponse,
  getSession,
  setSession,
} from "@/utils/authSession";
import * as authService from "@/modules/auth";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import { isAdminRole, isSaleRole, isOpsRole, isStaffRole } from "@/utils/routing";
import { isPublicPath, resolvePostLoginPath } from "@/utils/routeAccess";
import { toast } from "@/app/components/ToastProvider";

export function useAuth() {
  const router = useRouter();
  const [session, setSessionState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setIsReady(true);
  }, []);

  const loginWithCredentials = useCallback(
    async ({ email, password, redirectTo } = {}) => {
      const auth = await authService.login({ email, password });
      const nextSession = createSessionFromAuthResponse(auth, email);
      setSession(nextSession);
      setSessionState(nextSession);
      const path = resolvePostLoginPath(auth.role, redirectTo);
      if (typeof window !== "undefined" && !isPublicPath(path)) {
        // Hard navigate → flash so toast survives full reload.
        toast.flashSuccess("Đăng nhập thành công.");
        window.location.assign(path);
      } else {
        toast.success("Đăng nhập thành công.");
        router.push(path);
      }
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
    toast.success("Đăng xuất thành công.");
    router.push(ROUTES.auth.login);
  }, [router]);

  return {
    session,
    isLoggedIn: Boolean(session?.token),
    isReady,
    isAdmin: isAdminRole(session?.role),
    isStaff: isStaffRole(session?.role),
    isSale: isSaleRole(session?.role),
    isOps: isOpsRole(session?.role),
    loginWithCredentials,
    saveAuthSession,
    logout,
  };
}

export function useAuthErrorMessage(error) {
  return getErrorMessage(error);
}
