import { useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  AppstoreOutlined,
  BarChartOutlined,
  CalculatorOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  InboxOutlined,
  LogoutOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import logoVietnamLogistics from "../../assets/anhlogocap2.jpeg";
import UserProfileModal from "../../components/UserComponents/UserProfileModal";

import "./Sidebar.css";

/* =====================================================
   ROLE
===================================================== */

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const ROLE_INFO = {
  admin: {
    label: "Administrator",
    shortLabel: "Admin",
  },

  operationsmanager: {
    label: "Operations Manager",
    shortLabel: "Operations",
  },

  sale: {
    label: "Sales Staff",
    shortLabel: "Sale",
  },
};

/* =====================================================
   MENU
===================================================== */

const MENU_BY_ROLE = {
  admin: [
    {
      label: "Tổng quan",
      icon: <DashboardOutlined />,
      path: "/admin",
      end: true,
    },
    {
      label: "Quản lý người dùng",
      icon: <TeamOutlined />,
      path: "/admin/user",
    },
    {
      label: "Phân quyền hệ thống",
      icon: <SafetyCertificateOutlined />,
      path: "/admin/roles",
    },
    {
      label: "Cấu hình tham số",
      icon: <SettingOutlined />,
      path: "/admin/settings",
    },
    {
      label: "Nhật ký hệ thống",
      icon: <FileTextOutlined />,
      path: "/admin/logs",
    },
  ],

  operationsmanager: [
    {
      label: "Tổng quan vận hành",
      icon: <AppstoreOutlined />,
      path: "/operations-manager",
      end: true,
    },
    {
      label: "Quản lý đơn hàng",
      icon: <FileSearchOutlined />,
      path: "/operations-manager/orders",
    },
    {
      label: "Quản lý kiện hàng",
      icon: <InboxOutlined />,
      path: "/operations-manager/parcels",
    },
    {
      label: "Quản lý kho hàng",
      icon: <DatabaseOutlined />,
      path: "/operations-manager/warehouse",
    },
    {
      label: "Quản lý bảng giá",
      icon: <CalculatorOutlined />,
      path: "/operations-manager/pricing",
    },
    {
      label: "Báo cáo vận hành",
      icon: <BarChartOutlined />,
      path: "/operations-manager/reports",
    },
  ],

  sale: [
    {
      label: "Tổng quan",
      icon: <DashboardOutlined />,
      path: "/sale",
      end: true,
    },
    {
      label: "Quản lý khách hàng",
      icon: <UserOutlined />,
      path: "/sale/customers",
    },
    {
      label: "Yêu cầu ký gửi",
      icon: <FileSearchOutlined />,
      path: "/sale/consignments",
    },
    {
      label: "Yêu cầu mua hộ",
      icon: <ShoppingCartOutlined />,
      path: "/sale/purchase-requests",
    },
    {
      label: "Quản lý báo giá",
      icon: <CalculatorOutlined />,
      path: "/sale/quotations",
    },
    {
      label: "Chăm sóc khách hàng",
      icon: <CustomerServiceOutlined />,
      path: "/sale/customer-service",
    },
  ],
};

/* =====================================================
   STORAGE
===================================================== */

const getStoredUser = () => {
  try {
    const rawUser = sessionStorage.getItem("user");

    if (!rawUser) {
      return {};
    }

    const parsedUser = JSON.parse(rawUser);

    return parsedUser &&
      typeof parsedUser === "object"
      ? parsedUser
      : {};
  } catch (error) {
    console.error(
      "Không thể đọc user từ sessionStorage:",
      error
    );

    return {};
  }
};

const getAvatarText = (fullName) => {
  const name = String(fullName || "").trim();

  if (!name) {
    return "U";
  }

  const words = name
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  const firstLetter =
    words[0]?.charAt(0) || "";

  const lastLetter =
    words[words.length - 1]?.charAt(0) || "";

  return `${firstLetter}${lastLetter}`.toUpperCase();
};

const clearLoginSession = () => {
  const sessionKeys = [
    "accessToken",
    "refreshToken",
    "tokenExpiresAt",
    "user",
    "role",
    "isAuth",
  ];

  sessionKeys.forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

/* =====================================================
   COMPONENT
===================================================== */

export default function Sidebar() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [userProfile, setUserProfile] =
    useState(() => getStoredUser());

  const storedRole =
    sessionStorage.getItem("role") ||
    userProfile?.roleName ||
    userProfile?.role ||
    "admin";

  const normalizedRole =
    normalizeRole(storedRole);

  const currentRole =
    MENU_BY_ROLE[normalizedRole]
      ? normalizedRole
      : "admin";

  const menus =
    MENU_BY_ROLE[currentRole] || [];

  const roleInfo =
    ROLE_INFO[currentRole] ||
    ROLE_INFO.admin;

  const fullName =
    userProfile?.fullName ||
    userProfile?.name ||
    userProfile?.email ||
    "Người dùng";

  const email =
    userProfile?.email || "";

  const avatarText =
    getAvatarText(fullName);

  const handleOpenProfile = () => {
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);

    const latestUser = getStoredUser();

    if (Object.keys(latestUser).length > 0) {
      setUserProfile(latestUser);
    }
  };

  const handleProfileUpdated = (updatedProfile) => {
    if (!updatedProfile) {
      return;
    }

    setUserProfile((previous) => ({
      ...previous,
      ...updatedProfile,
    }));
  };

  const handleLogout = () => {
    clearLoginSession();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      <aside className="sidebar vcl-sidebar">
        <div className="vcl-sidebar__brand">
          <div className="vcl-sidebar__logo-box">
            <img
              src={logoVietnamLogistics}
              alt="Vietnam Logistics"
              className="vcl-sidebar__logo"
            />
          </div>

          <div className="vcl-sidebar__brand-content">
            <strong>VIETNAM LOGISTICS</strong>
            <span>Cross-border platform</span>
          </div>
        </div>

        <div className="vcl-sidebar__separator" />

        <section className="vcl-sidebar__navigation">
          <div className="vcl-sidebar__section-title">
            <span>KHÔNG GIAN LÀM VIỆC</span>
          </div>

          <nav
            className="vcl-sidebar__menu"
            aria-label="Điều hướng chính"
          >
            {menus.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.end)}
                title={item.label}
                style={{
                  "--vcl-menu-index": index,
                }}
                className={({ isActive }) =>
                  `vcl-menu-item${
                    isActive
                      ? " vcl-menu-item--active"
                      : ""
                  }`
                }
              >
                <span className="vcl-menu-item__active-bar" />

                <span className="vcl-menu-item__icon">
                  {item.icon}
                </span>

                <span className="vcl-menu-item__label">
                  {item.label}
                </span>

                <RightOutlined className="vcl-menu-item__arrow" />
              </NavLink>
            ))}
          </nav>
        </section>

        <footer className="vcl-sidebar__footer">
          <button
            type="button"
            className="vcl-profile-card"
            onClick={handleOpenProfile}
            aria-label="Mở thông tin cá nhân"
          >
            <span className="vcl-profile-card__avatar">
              {avatarText}

              <span className="vcl-profile-card__status" />
            </span>

            <span className="vcl-profile-card__info">
              <strong>{fullName}</strong>

              <span>{roleInfo.label}</span>

              {email && (
                <small>{email}</small>
              )}
            </span>

            <span className="vcl-profile-card__action">
              <RightOutlined />
            </span>
          </button>

          <button
            type="button"
            className="vcl-logout-button"
            onClick={handleLogout}
          >
            <LogoutOutlined />

            <span>Đăng xuất hệ thống</span>
          </button>

          <p className="vcl-sidebar__version">
            VCL Management System · 2026
          </p>
        </footer>
      </aside>

      <UserProfileModal
        open={profileOpen}
        onClose={handleCloseProfile}
        onUpdated={handleProfileUpdated}
      />
    </>
  );
}