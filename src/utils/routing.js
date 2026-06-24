import { ROUTES } from "@/utils/appRoutes";

/** Điều hướng sau đăng nhập theo role từ JWT. */
export function getHomeRouteByRole(role) {
  switch (role) {
    case "Admin":
      return ROUTES.admin.users;
    case "Sale":
      return ROUTES.sales.consignments;
    case "OperationsManager":
      return ROUTES.operations.dashboard;
    default:
      return ROUTES.auth.login;
  }
}

export function isAdminRole(role) {
  return role === "Admin";
}

export function isSaleRole(role) {
  return role === "Sale";
}

export function isOpsRole(role) {
  return role === "OperationsManager";
}

/** @deprecated Dùng isSaleRole — giữ tương thích code cũ. */
export function isStaffRole(role) {
  return isSaleRole(role);
}
