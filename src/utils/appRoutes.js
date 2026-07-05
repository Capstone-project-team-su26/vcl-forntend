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
    consignments: `${PAGES}/admin/consignments`,
    consignment: (id) => `${PAGES}/admin/consignments/${id}`,
    consignmentQuotation: (id) => `${PAGES}/admin/consignments/${id}/quotation`,
    restrictedItems: `${PAGES}/admin/restricted-items`,
    pricingRules: `${PAGES}/admin/pricing-rules`,
    warehouses: `${PAGES}/admin/warehouses`,
    shippingMethods: `${PAGES}/admin/shipping-methods`,
    additionalServiceFees: `${PAGES}/admin/additional-service-fees`,
  },
  sales: {
    home: `${PAGES}/sales`,
    customers: `${PAGES}/sales/customers`,
    customer: (id) => `${PAGES}/sales/customers/${id}`,
    consignments: `${PAGES}/sales/consignments`,
    createConsignment: `${PAGES}/sales/consignments/create`,
    consignment: (id) => `${PAGES}/sales/consignments/${id}`,
    receivingNote: (id) => `${PAGES}/sales/consignments/${id}/receiving-note`,
    purchaseRequests: `${PAGES}/sales/purchase-requests`,
    purchaseRequest: (id) => `${PAGES}/sales/purchase-requests/${id}`,
    purchaseRequestQuotation: (id) => `${PAGES}/sales/purchase-requests/${id}/quotation`,
    consignmentQuotation: (id) => `${PAGES}/sales/consignments/${id}/quotation`,
    purchaseRequestPurchaseOrder: (id) =>
      `${PAGES}/sales/purchase-requests/${id}/purchase-order`,
    purchaseOrderStatus: (id) => `${PAGES}/sales/purchase-orders/${id}/status`,
  },
  operations: {
    dashboard: `${PAGES}/operations`,
  },
};

export const AUTH_PATH_PREFIX = `${PAGES}/auth`;
export const ADMIN_PATH_PREFIX = `${PAGES}/admin`;
export const SALES_PATH_PREFIX = `${PAGES}/sales`;
export const OPERATIONS_PATH_PREFIX = `${PAGES}/operations`;
