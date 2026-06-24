/** URL paths — đồng bộ với cấu trúc `src/app/pages/`. */
const PAGES = "/pages";

export const ROUTES = {
  auth: {
    login: `${PAGES}/auth/login`,
    forgotPassword: `${PAGES}/auth/forgot-password`,
    resetPassword: `${PAGES}/auth/reset-password`,
  },
  admin: {
    users: `${PAGES}/admin/users`,
    restrictedItems: `${PAGES}/admin/restricted-items`,
    pricingRules: `${PAGES}/admin/pricing-rules`,
  },
  sales: {
    home: `${PAGES}/sales`,
    consignments: `${PAGES}/sales/consignments`,
    consignment: (id) => `${PAGES}/sales/consignments/${id}`,
    transfer: `${PAGES}/sales/transfer`,
  },
  operations: {
    dashboard: `${PAGES}/operations`,
  },
};

export const AUTH_PATH_PREFIX = `${PAGES}/auth`;
export const ADMIN_PATH_PREFIX = `${PAGES}/admin`;
export const SALES_PATH_PREFIX = `${PAGES}/sales`;
export const OPERATIONS_PATH_PREFIX = `${PAGES}/operations`;
