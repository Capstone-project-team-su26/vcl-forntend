import { getHomeRouteByRole } from "@/utils/routing";

/** Role groups dùng chung middleware + AuthGuard. */
export const ROLE_GROUPS = {
  ADMIN: ["Admin"],
  STAFF: ["Sale", "WarehouseStaff", "OperationsManager"],
  CUSTOMER: ["Customer"],
  OPS: ["OperationsManager"],
};

const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

/** Route công khai — không cần đăng nhập. */
export function isPublicPath(pathname) {
  if (!pathname) return true;
  if (pathname === "/") return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/customer")) return true;
  if (pathname.startsWith("/pricing")) return true;
  if (AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return false;
}

/** null = không giới hạn role (chỉ cần public). Mảng rỗng = cần login, mọi role. */
export function getRequiredRoles(pathname) {
  if (!pathname || isPublicPath(pathname)) return null;

  if (pathname.startsWith("/admin")) return ROLE_GROUPS.ADMIN;
  if (pathname.startsWith("/staff")) return ROLE_GROUPS.STAFF;
  if (pathname.startsWith("/operational-dashboard")) return ROLE_GROUPS.OPS;
  if (pathname.startsWith("/transfer")) return ROLE_GROUPS.STAFF;
  if (pathname.startsWith("/profile") || pathname.startsWith("/purchaserequest")) {
    return ROLE_GROUPS.CUSTOMER;
  }

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
  return getHomeRouteByRole(role) || "/";
}

export function buildLoginUrl(returnPath) {
  if (returnPath && isSafeInternalPath(returnPath) && !isPublicPath(returnPath)) {
    return `/login?next=${encodeURIComponent(returnPath)}`;
  }
  return "/login";
}
