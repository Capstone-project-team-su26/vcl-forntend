import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest, apiRequestWithMockFallback } from "@/utils/apiClient";
import {
  normalizeCustomerFromApi,
  normalizeCustomerListResponse,
  toApiCustomerPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

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

function normalizePhone(phone) {
  return phone?.replace(/\s+/g, "") ?? "";
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

function findDuplicateCustomer({ phone, email, excludeId }) {
  const store = getMockStore();
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedPhone) {
    const phoneDuplicate = store.customers.find(
      (item) =>
        item.id !== excludeId && normalizePhone(item.phone) === normalizedPhone
    );
    if (phoneDuplicate) {
      return { field: "phone", message: "Số điện thoại đã được sử dụng cho khách hàng khác." };
    }
  }

  if (normalizedEmail) {
    const emailDuplicate = store.customers.find(
      (item) =>
        item.id !== excludeId && normalizeEmail(item.email) === normalizedEmail
    );
    if (emailDuplicate) {
      return { field: "email", message: "Email đã được sử dụng cho khách hàng khác." };
    }
  }

  return null;
}

function filterCustomers(items, search) {
  if (!search) return items.map((item) => ({ ...item }));

  const query = search.toLowerCase();
  return items
    .filter((item) => {
      const haystack = [
        item.customerCode,
        item.id,
        item.fullName,
        item.email,
        item.phone,
        item.address,
        item.companyName,
        item.taxId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .map((item) => ({ ...item }));
}

function validateCustomerPayload(payload, { requireAll = false, excludeId } = {}) {
  const fullName = payload.fullName?.trim();
  const phone = payload.phone?.trim();
  const email = payload.email?.trim() || null;

  if (requireAll || payload.fullName !== undefined) {
    if (!fullName) throw new ApiError(400, { message: "Vui lòng nhập họ tên khách hàng." });
  }

  if (requireAll || payload.phone !== undefined) {
    if (!phone) throw new ApiError(400, { message: "Vui lòng nhập số điện thoại." });
  }

  const duplicate = findDuplicateCustomer({ phone, email, excludeId });
  if (duplicate) {
    throw new ApiError(400, { message: duplicate.message });
  }

  return {
    fullName,
    phone,
    email,
    address: payload.address?.trim() || null,
    companyName: payload.companyName?.trim() || null,
    taxId: payload.taxId?.trim() || null,
    status: payload.status || "ACTIVE",
  };
}

async function listCustomersMock({ search } = {}) {
  await mockDelay();
  return filterCustomers(getMockStore().customers, search?.trim());
}

async function getCustomerMock(id) {
  await mockDelay();
  const customer = getMockStore().customers.find((item) => item.id === id);
  if (!customer) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }
  return { ...customer };
}

async function createCustomerMock(payload) {
  await mockDelay();

  const data = validateCustomerPayload(payload, { requireAll: true });
  const id = nextMockId("CUS");

  const item = {
    id,
    customerCode: id,
    ...data,
  };

  getMockStore().customers.unshift(item);
  return { message: "Tạo hồ sơ khách hàng thành công.", customer: { ...item } };
}

async function updateCustomerMock(id, payload) {
  await mockDelay();

  const item = getMockStore().customers.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }

  const data = validateCustomerPayload({ ...item, ...payload }, { excludeId: id });
  Object.assign(item, data);

  return { message: "Cập nhật hồ sơ khách hàng thành công.", customer: { ...item } };
}

function buildQuery({ search }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ search?: string }} params
 */
export async function listCustomers(params = {}) {
  if (isMockMode()) return listCustomersMock(params);

  const raw = await apiRequestWithMockFallback(
    `/api/customers${buildQuery({ search: params.search })}`,
    {},
    () => listCustomersMock(params)
  );
  return normalizeCustomerListResponse(raw);
}

export async function getCustomer(id) {
  if (isMockMode()) return getCustomerMock(id);

  const raw = await apiRequestWithMockFallback(
    `/api/customers/${id}`,
    {},
    () => getCustomerMock(id)
  );
  const item = raw?.data ?? raw?.customer ?? raw;
  if (!item?.id && !item?.customerId) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }
  return normalizeCustomerFromApi(item);
}

export async function createCustomer(payload) {
  if (isMockMode()) return createCustomerMock(payload);

  const raw = await apiRequestWithMockFallback(
    "/api/customers",
    {
      method: "POST",
      body: JSON.stringify(toApiCustomerPayload(payload)),
    },
    () => createCustomerMock(payload)
  );

  const customer = normalizeCustomerFromApi(raw?.customer ?? raw?.data ?? raw);
  return { message: raw?.message || "Tạo hồ sơ khách hàng thành công.", customer };
}

export async function updateCustomer(id, payload) {
  if (isMockMode()) return updateCustomerMock(id, payload);

  const raw = await apiRequestWithMockFallback(
    `/api/customers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(toApiCustomerPayload(payload)),
    },
    () => updateCustomerMock(id, payload)
  );

  const customer = normalizeCustomerFromApi(raw?.customer ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật hồ sơ khách hàng thành công.", customer };
}

export function formatCustomerStatus(status) {
  return CUSTOMER_STATUS_LABELS[status] || status || "—";
}

export function buildCreateConsignmentUrl(customerId, orderType) {
  const params = new URLSearchParams({ customerId });
  if (orderType) params.set("orderType", orderType);
  return `${ROUTES.sales.createConsignment}?${params.toString()}`;
}
