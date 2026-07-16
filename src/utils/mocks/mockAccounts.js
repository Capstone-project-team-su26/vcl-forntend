import { getMockStore } from "@/utils/mocks/mockStore";
import { ROUTES } from "@/utils/appRoutes";

/**
 * Acc seed trên BE (GET /api/Test/seed-admin, seed-staff) + ops tạo qua Admin.
 * Chỉ hiện nút khi NODE_ENV=development — mật khẩu seed/dev công khai.
 */
export const API_TEST_ACCOUNTS = [
  {
    email: "sales@test.com",
    password: "Sales123",
    role: "Sale",
    label: "Sale (API)",
    hint: "Quản lý ký gửi — /pages/sales/consignments",
  },
  {
    email: "admin@test.com",
    password: "Admin123",
    role: "Admin",
    label: "Admin (API)",
    hint: "Seed: GET /api/Test/seed-admin",
  },
  {
    email: "ops@test.com",
    password: "Ops123",
    role: "OperationsManager",
    label: "Ops (API)",
    hint: `Vận hành → ${ROUTES.operations.dashboard}`,
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

  // Không fuzzy-match "admin"/"sale" trong email — tránh leo role ngoài whitelist.
  return null;
}
