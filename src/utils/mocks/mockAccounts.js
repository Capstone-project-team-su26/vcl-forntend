import { getMockStore } from "@/utils/mocks/mockStore";
import { ROUTES } from "@/utils/appRoutes";

/** Email gợi ý khi NEXT_PUBLIC_DATA_SOURCE=api — mật khẩu không commit vào repo. */
export const API_TEST_ACCOUNTS = [
  {
    email: "sale01@vcl.com",
    role: "Sale",
    label: "Sale (API)",
    hint: "Quản lý ký gửi — /pages/sales/consignments",
  },
  {
    email: "admin@test.com",
    role: "Admin",
    label: "Admin (API)",
    hint: "Seed: GET /api/Test/seed-admin",
  },
];

/** Tài khoản mock cố định — mật khẩu bất kỳ khi NEXT_PUBLIC_DATA_SOURCE=mock */
export const MOCK_TEST_ACCOUNTS = [
  {
    email: "sale@vcl.com",
    role: "Sale",
    fullName: "Nguyen Van Sale",
    label: "Sale",
    hint: `Ký gửi → ${ROUTES.sales.consignments}`,
  },
  {
    email: "admin@vcl.com",
    role: "Admin",
    fullName: "Mock Admin",
    label: "Admin",
    hint: `Quản trị → ${ROUTES.admin.users}`,
  },
  {
    email: "ops@vcl.com",
    role: "OperationsManager",
    fullName: "Le Van Ops",
    label: "Operations",
    hint: `Vận hành → ${ROUTES.operations.dashboard}`,
  },
];

const MOCK_ROLE_BY_EMAIL = Object.fromEntries(
  MOCK_TEST_ACCOUNTS.map((account) => [account.email.toLowerCase(), account])
);

export function resolveMockAccount(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;

  const preset = MOCK_ROLE_BY_EMAIL[normalized];
  if (preset) return preset;

  const storeUser = getMockStore().users.find(
    (user) => user.email.toLowerCase() === normalized
  );
  if (storeUser) {
    return {
      email: storeUser.email,
      role: storeUser.role,
      fullName: storeUser.name,
      label: storeUser.role,
    };
  }

  if (normalized.includes("admin")) {
    return { email: normalized, role: "Admin", fullName: "Mock Admin", label: "Admin" };
  }
  if (normalized.includes("sale")) {
    return {
      email: normalized,
      role: "Sale",
      fullName: "Nguyen Van Sale",
      label: "Sale",
    };
  }
  if (normalized.includes("ops")) {
    return {
      email: normalized,
      role: "OperationsManager",
      fullName: "Le Van Ops",
      label: "Operations",
    };
  }

  return null;
}
