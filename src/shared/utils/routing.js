/** Điều hướng sau đăng nhập theo role từ JWT. */
export function getHomeRouteByRole(role) {
  switch (role) {
    case "Admin":
      return "/admin/users";
    case "Customer":
      return "/profile";
    case "Sale":
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
