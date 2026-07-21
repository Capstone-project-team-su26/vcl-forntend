import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeShippingMethodFromApi,
  normalizeShippingMethodListResponse,
  toApiShippingMethodPayload,
} from "./mappers";

function buildQuery({ search, isActive, activeOnly }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  if (activeOnly) params.set("activeOnly", "true");
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ search?: string; isActive?: boolean | string; activeOnly?: boolean }} params
 */
export async function listShippingMethodsApi(params = {}) {
  const activeOnly = params.activeOnly === true;

  try {
    const raw = await apiRequest(
      `/api/shipping-methods${buildQuery({
        search: params.search,
        isActive: params.isActive,
        activeOnly,
      })}`
    );
    const items = normalizeShippingMethodListResponse(raw);
    return activeOnly ? items.filter((item) => item.isActive) : items;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createShippingMethodApi(payload) {
  const raw = await apiRequest("/api/shipping-methods", {
    method: "POST",
    body: JSON.stringify(toApiShippingMethodPayload(payload)),
  });

  const shippingMethod = normalizeShippingMethodFromApi(
    raw?.shippingMethod ?? raw?.data ?? raw
  );
  return { message: raw?.message || "Thêm phương thức vận chuyển thành công.", shippingMethod };
}

export async function updateShippingMethodApi(id, payload) {
  const raw = await apiRequest(`/api/shipping-methods/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiShippingMethodPayload(payload)),
  });

  const shippingMethod = normalizeShippingMethodFromApi(
    raw?.shippingMethod ?? raw?.data ?? { ...payload, id }
  );
  return {
    message: raw?.message || "Cập nhật phương thức vận chuyển thành công.",
    shippingMethod,
  };
}

export async function deleteShippingMethodApi(id) {
  return apiRequest(`/api/shipping-methods/${id}`, { method: "DELETE" });
}
