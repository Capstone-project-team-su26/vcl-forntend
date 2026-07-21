import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeCarrierFromApi,
  normalizeCarrierListResponse,
  toApiCarrierPayload,
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
export async function listCarriersApi(params = {}) {
  const activeOnly = params.activeOnly === true;

  try {
    const raw = await apiRequest(
      `/api/carriers${buildQuery({
        search: params.search,
        isActive: params.isActive,
        activeOnly,
      })}`
    );
    const items = normalizeCarrierListResponse(raw);
    return activeOnly ? items.filter((item) => item.isActive) : items;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createCarrierApi(payload) {
  const raw = await apiRequest("/api/carriers", {
    method: "POST",
    body: JSON.stringify(toApiCarrierPayload(payload)),
  });

  const carrier = normalizeCarrierFromApi(raw?.carrier ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm đơn vị vận chuyển thành công.", carrier };
}

export async function updateCarrierApi(id, payload) {
  const raw = await apiRequest(`/api/carriers/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiCarrierPayload(payload)),
  });

  const carrier = normalizeCarrierFromApi(raw?.carrier ?? raw?.data ?? { ...payload, id });
  return {
    message: raw?.message || "Cập nhật đơn vị vận chuyển thành công.",
    carrier,
  };
}

export async function deleteCarrierApi(id) {
  return apiRequest(`/api/carriers/${id}`, { method: "DELETE" });
}
