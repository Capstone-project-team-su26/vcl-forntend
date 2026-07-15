import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/LoginPage/Login";
import MainLayout from "../layouts/mainLayout";
import RequireAuth from "./PrivateRoute";

/* ================= SALE ================= */

import PendingConsignmentList from "../pages/SalePage/ConsignmentsPage/PendingConsignmentList";

/* ================= HELPERS ================= */

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

export default function AppRoutes() {
  const token = sessionStorage.getItem("accessToken");

  const isAuth =
    sessionStorage.getItem("isAuth") === "true";

  const role = normalizeRole(
    sessionStorage.getItem("role")
  );

  const redirectByRole = {
    admin: "/admin",
    sale: "/sale/consignments",
    operationsmanager: "/operations-manager",
  };

  const isLoggedIn = Boolean(token && isAuth);

  return (
    <Routes>
      {/* ================= LOGIN ================= */}

      <Route
        path="/login"
        element={
          isLoggedIn && redirectByRole[role] ? (
            <Navigate
              to={redirectByRole[role]}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <RequireAuth role="Admin">
            <MainLayout />
          </RequireAuth>
        }
      />

      {/* ================= SALE ================= */}

      <Route
        path="/sale"
        element={
          <RequireAuth role="Sale">
            <MainLayout />
          </RequireAuth>
        }
      >
    

        {/* Danh sách yêu cầu ký gửi chờ duyệt */}
        <Route
          path="/sale/consignments"
          element={<PendingConsignmentList />}
        />
      </Route>

      {/* ========== OPERATIONS MANAGER ========== */}

      <Route
        path="/operations-manager"
        element={
          <RequireAuth role="OperationsManager">
            <MainLayout />
          </RequireAuth>
        }
      />

      {/* ================= ROOT ================= */}

      <Route
        path="/"
        element={
          isLoggedIn && redirectByRole[role] ? (
            <Navigate
              to={redirectByRole[role]}
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}