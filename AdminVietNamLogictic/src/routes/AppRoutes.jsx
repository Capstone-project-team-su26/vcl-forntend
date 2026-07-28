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

import ConsignmentDetail from "../pages/SalePage/ConsignmentsPage/ConsigmentsDetail/ConsignmentDetail";

import CreateConsignmentQuotation from "../pages/SalePage/ConsignmentsPage/CreateConsigmentsQotation/CreateConsignmentQuotation";

import CustomerList from "../pages/SalePage/CusTomerPagesale/CustomerList"
import RestrictedItems from "../pages/SalePage/BanItem/RestrictedItems";
import ServicePricings from "../pages/SalePage/ServicePricingRule/ServicePricings";
import PendingConsignmentListHistory from "../pages/SalePage/HistorySalePage/HistoryOrderPage/PendingConsignmentListHistory"
import OrderPaymentHistory from "../pages/SalePage/HistorySalePage/HistoryOrderPage/OrderDetailhisstory/OrderPaymentHistory";
/* ================= ROLE CONFIG ================= */

const ROLE_HOME = {
  admin: "/admin",
  sale: "/sale/consignments",
  operationsmanager: "/operations-manager",
};

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

/* ================= CLEAR AUTH ================= */

const clearAuthStorage = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("tokenExpiresAt");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("isAuth");
};

/* ================= REDIRECT COMPONENT ================= */

function RoleRedirect() {
  const accessToken =
    sessionStorage.getItem("accessToken");

  const isAuth =
    sessionStorage.getItem("isAuth") === "true";

  const role = normalizeRole(
    sessionStorage.getItem("role")
  );

  const isLoggedIn = Boolean(
    accessToken && isAuth
  );

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const homePath = ROLE_HOME[role];

  // Có token nhưng role không hợp lệ
  if (!homePath) {
    clearAuthStorage();

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Navigate
      to={homePath}
      replace
    />
  );
}

/* ================= LOGIN ROUTE ================= */

function LoginRoute() {
  const accessToken =
    sessionStorage.getItem("accessToken");

  const isAuth =
    sessionStorage.getItem("isAuth") === "true";

  const role = normalizeRole(
    sessionStorage.getItem("role")
  );

  const homePath = ROLE_HOME[role];

  if (
    accessToken &&
    isAuth &&
    homePath
  ) {
    return (
      <Navigate
        to={homePath}
        replace
      />
    );
  }

  return <Login />;
}

/* ================= NOT FOUND ================= */

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "64px",
            color: "#1d4ed8",
          }}
        >
          404
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
          }}
        >
          Không tìm thấy trang bạn yêu cầu.
        </p>
      </div>
    </div>
  );
}

/* ================= ROUTES ================= */

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= LOGIN ================= */}

      <Route
        path="/login"
        element={<LoginRoute />}
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <MainLayout />
          </RequireAuth>
        }
      />

      {/* ================= SALE ================= */}

      <Route
        path="/sale"
        element={
          <RequireAuth role="sale">
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* Truy cập /sale */}
        <Route
          index
          element={
            <Navigate
              to="consignments"
              replace
            />
          }
        />

        {/* Danh sách đơn ký gửi */}
        <Route
          path="consignments"
          element={
            <PendingConsignmentList />
          }
        />

        {/* Chi tiết đơn ký gửi */}
        <Route
          path="consignments/:orderId"
          element={
            <ConsignmentDetail />
          }
        />

        {/* Màn hình tạo báo giá riêng */}
        <Route
          path="consignments/:orderId/create-quotation"
          element={
            <CreateConsignmentQuotation />
          }
        />
      

<Route
  path="customers"
  element={<CustomerList />}
/>

<Route
  path="/sale/restricted-items"
  element={<RestrictedItems />}
/>

<Route
  path="/sale/service-pricings"
  element={<ServicePricings />}
/>
<Route
  path="history/order"
  element={
    <PendingConsignmentListHistory />
  }
/>

<Route
  path="orders/:orderId/payments/history"
  element={
    <OrderPaymentHistory />
  }
/>
      </Route>

      {/* ========== OPERATIONS MANAGER ========== */}

      <Route
        path="/operations-manager"
        element={
          <RequireAuth role="operationsmanager">
            <MainLayout />
          </RequireAuth>
        }
      />

      {/* ================= ROOT ================= */}

      <Route
        path="/"
        element={<RoleRedirect />}
      />

      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

