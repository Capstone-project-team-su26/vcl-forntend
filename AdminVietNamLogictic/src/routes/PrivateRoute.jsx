import { Navigate } from "react-router-dom";

const ROLE_HOME = {
  sale: "/sale",
  admin: "/admin",
  operationsmanager: "/operations-manager",
};

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

export default function RequireAuth({
  children,
  role,
  roles,
}) {
  const accessToken =
    sessionStorage.getItem("accessToken");

  const isAuth =
    sessionStorage.getItem("isAuth") === "true";

  const storedRole =
    sessionStorage.getItem("role");

  const userRole = normalizeRole(storedRole);

  // Chưa đăng nhập hoặc không có token
  if (!isAuth || !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role trong session không hợp lệ
  if (!ROLE_HOME[userRole]) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Hỗ trợ role="Admin" hoặc roles={["Admin", "Sale"]}
  const requiredRoles = (
    roles || (role ? [role] : [])
  )
    .map(normalizeRole)
    .filter(Boolean);

  const hasPermission =
    requiredRoles.length === 0 ||
    requiredRoles.includes(userRole);

  // Đã đăng nhập nhưng truy cập sai khu vực
  if (!hasPermission) {
    return (
      <Navigate
        to={ROLE_HOME[userRole]}
        replace
      />
    );
  }

  return children;
}