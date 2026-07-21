import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeCustomerFromApi,
  normalizeCustomerListResponse,
  toApiCustomerPayload,
} from "./mappers";

function buildQuery({ search }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ search?: string }} params
 */
export async function listCustomersApi(params = {}) {
  const raw = await apiRequest(`/api/customers${buildQuery({ search: params.search })}`);
  return normalizeCustomerListResponse(raw);
}

export async function getCustomerApi(id) {
  const raw = await apiRequest(`/api/customers/${id}`);
  const item = raw?.data ?? raw?.customer ?? raw;
  if (!item?.id && !item?.customerId) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }
  return normalizeCustomerFromApi(item);
}

export async function createCustomerApi(payload) {
  const raw = await apiRequest("/api/customers", {
    method: "POST",
    body: JSON.stringify(toApiCustomerPayload(payload)),
  });

  const customer = normalizeCustomerFromApi(raw?.customer ?? raw?.data ?? raw);
  return { message: raw?.message || "Tạo hồ sơ khách hàng thành công.", customer };
}

export async function updateCustomerApi(id, payload) {
  const raw = await apiRequest(`/api/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiCustomerPayload(payload)),
  });

  const customer = normalizeCustomerFromApi(raw?.customer ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật hồ sơ khách hàng thành công.", customer };
}
