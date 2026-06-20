/** Điều hướng sau đăng nhập theo role từ JWT. */
export function getHomeRouteByRole(role) {
  switch (role) {
    case "Admin":
      return "/admin/users";
    case "Customer":
      return "/profile";
    case "Sale":
      return "/staff?salesTab=consignments";
    case "WarehouseStaff":
    case "OperationsManager":
      return "/staff";
    default:
      return "/";
  }
}

export function isAdminRole(role) {
  return role === "Admin";
}

const STAFF_ROLES = ["Sale", "WarehouseStaff", "OperationsManager"];

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

export function isSaleRole(role) {
  return role === "Sale";
}
