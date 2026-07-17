"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  buildLoginUrl,
  canRoleAccessRoute,
  getForbiddenRedirect,
} from "@/utils/routeAccess";
import styles from "./AuthGuard.module.scss";

/**
 * Chặn route phía client (bổ sung cho middleware + cookie).
 * @param {object} props
 * @param {string[] | null | undefined} props.allowedRoles — null/undefined = chỉ cần đăng nhập
 * @param {import("react").ReactNode} props.children
 */
export default function AuthGuard({ allowedRoles, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isReady } = useAuth();

  const role = session?.role;
  const isAuthed = Boolean(session?.token);
  const notExpired =
    !session?.expiresAt || new Date(session.expiresAt).getTime() > Date.now();
  const roleAllowed =
    !allowedRoles || allowedRoles.length === 0
      ? true
      : Boolean(role && allowedRoles.includes(role));
  const pathAllowed = canRoleAccessRoute(role, pathname);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthed || !notExpired) {
      router.replace(buildLoginUrl(pathname));
      return;
    }

    if (!roleAllowed || !pathAllowed) {
      router.replace(`${getForbiddenRedirect(role)}?error=forbidden`);
    }
  }, [isReady, isAuthed, notExpired, role, roleAllowed, pathAllowed, pathname, router]);

  if (!isReady || !isAuthed || !notExpired || !roleAllowed || !pathAllowed) {
    return (
      <div className={styles.root}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return children;
}
