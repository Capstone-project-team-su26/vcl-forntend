import { isMockMode } from "@/utils/mocks/dataSource";
import { ROUTES } from "@/utils/appRoutes";
import {
  listCustomersApi,
  getCustomerApi,
  createCustomerApi,
  updateCustomerApi,
} from "./api";
import {
  listCustomersMock,
  getCustomerMock,
  createCustomerMock,
  updateCustomerMock,
} from "./mock";

export {
  normalizeCustomerFromApi,
  normalizeCustomerListResponse,
  toApiCustomerPayload,
} from "./mappers";

export const CUSTOMER_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  PENDING: "Chờ xác minh",
  INACTIVE: "Ngừng hoạt động",
};

export const CUSTOMER_STATUS_STYLES = {
  ACTIVE: "bg-success-bg text-success-text",
  PENDING: "bg-warning-bg text-warning-text",
  INACTIVE: "bg-surface text-muted",
};

/**
 * @param {{ search?: string }} params
 */
export async function listCustomers(params = {}) {
  if (isMockMode()) return listCustomersMock(params);
  return listCustomersApi(params);
}

export async function getCustomer(id) {
  if (isMockMode()) return getCustomerMock(id);
  return getCustomerApi(id);
}

export async function createCustomer(payload) {
  if (isMockMode()) return createCustomerMock(payload);
  return createCustomerApi(payload);
}

export async function updateCustomer(id, payload) {
  if (isMockMode()) return updateCustomerMock(id, payload);
  return updateCustomerApi(id, payload);
}

export function formatCustomerStatus(status) {
  return CUSTOMER_STATUS_LABELS[status] || status || "—";
}

export function buildCreateConsignmentUrl(customerId, orderType) {
  const params = new URLSearchParams({ customerId });
  if (orderType) params.set("orderType", orderType);
  return `${ROUTES.sales.createConsignment}?${params.toString()}`;
}
