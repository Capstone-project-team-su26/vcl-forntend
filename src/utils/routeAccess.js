import { ROUTES, ADMIN_PATH_PREFIX, SALES_PATH_PREFIX, OPERATIONS_PATH_PREFIX } from "@/utils/appRoutes";
import { getHomeRouteByRole } from "@/utils/routing";

/** Role groups dùng chung middleware + AuthGuard. */
export const ROLE_GROUPS = {
  ADMIN: ["Admin"],
  SALE: ["Sale"],
  OPS: ["OperationsManager"],
};

/** Route công khai — không cần đăng nhập. */
export function isPublicPath(pathname) {
  if (!pathname) return true;
  if (pathname === "/") return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === ROUTES.auth.login || pathname.startsWith(`${ROUTES.auth.login}/`)) return true;
  if (pathname === ROUTES.auth.forgotPassword || pathname.startsWith(`${ROUTES.auth.forgotPassword}/`)) {
    return true;
  }
  if (pathname === ROUTES.auth.resetPassword || pathname.startsWith(`${ROUTES.auth.resetPassword}/`)) {
    return true;
  }
  return false;
}

/** null = không giới hạn role (chỉ cần public). Mảng rỗng = cần login, mọi role. */
export function getRequiredRoles(pathname) {
  if (!pathname || isPublicPath(pathname)) return null;

  if (pathname.startsWith(ADMIN_PATH_PREFIX)) return ROLE_GROUPS.ADMIN;
  if (pathname.startsWith(SALES_PATH_PREFIX)) return ROLE_GROUPS.SALE;
  if (pathname.startsWith(OPERATIONS_PATH_PREFIX)) return ROLE_GROUPS.OPS;

  return null;
}

export function canRoleAccessRoute(role, pathname) {
  const required = getRequiredRoles(pathname);
  if (!required) return true;
  if (!role) return false;
  return required.includes(role);
}

export function isSafeInternalPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function resolvePostLoginPath(role, nextPath) {
  if (
    nextPath &&
    isSafeInternalPath(nextPath) &&
    !isPublicPath(nextPath) &&
    canRoleAccessRoute(role, nextPath)
  ) {
    return nextPath;
  }
  return getHomeRouteByRole(role);
}

export function getForbiddenRedirect(role) {
  return getHomeRouteByRole(role) || ROUTES.auth.login;
}

export function buildLoginUrl(returnPath) {
  if (returnPath && isSafeInternalPath(returnPath) && !isPublicPath(returnPath)) {
    return `${ROUTES.auth.login}?next=${encodeURIComponent(returnPath)}`;
  }
  return ROUTES.auth.login;
}
