import { apiRequest } from "@/utils/apiClient";
import {
  normalizeRestrictedItemFromApi,
  toApiRestrictedItemPayload,
} from "./mappers";

function buildQuery({ search, restrictionType }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (restrictionType) params.set("restrictionType", restrictionType);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ search?: string; restrictionType?: string }} params
 */
export async function listRestrictedItemsApi(params = {}) {
  const raw = await apiRequest(`/api/restricted-items${buildQuery(params)}`);
  const items = Array.isArray(raw) ? raw : raw?.data ?? [];
  return items.map(normalizeRestrictedItemFromApi);
}

export async function createRestrictedItemApi(payload) {
  const raw = await apiRequest("/api/restricted-items", {
    method: "POST",
    body: JSON.stringify(toApiRestrictedItemPayload(payload)),
  });

  const item = normalizeRestrictedItemFromApi(raw?.item ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm mặt hàng thành công.", item };
}

export async function updateRestrictedItemApi(id, payload) {
  const body = toApiRestrictedItemPayload({
    name: payload.name,
    country: payload.country,
    restrictionType: payload.restrictionType,
    notes: payload.notes,
    isActive: payload.isActive,
  });

  const raw = await apiRequest(`/api/restricted-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const item = normalizeRestrictedItemFromApi(raw?.item ?? raw?.data ?? { ...body, id });
  return { message: raw?.message || "Cập nhật mặt hàng thành công.", item };
}

export async function deleteRestrictedItemApi(id) {
  return apiRequest(`/api/restricted-items/${id}`, {
    method: "DELETE",
  });
}
