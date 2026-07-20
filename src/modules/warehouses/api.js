import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  normalizeWarehouseLocationFromApi,
  normalizeWarehouseLocationListResponse,
  toApiWarehouseLocationPayload,
  toApiWarehousePayload,
} from "./mappers";

function buildWarehouseQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listWarehousesApi(params = {}) {
  const raw = await apiRequest(`/api/warehouses${buildWarehouseQuery(params)}`);
  return normalizeWarehouseListResponse(raw);
}

export async function createWarehouseApi(payload) {
  const raw = await apiRequest("/api/warehouses", {
    method: "POST",
    body: JSON.stringify(toApiWarehousePayload(payload)),
  });

  const warehouse = normalizeWarehouseFromApi(raw?.warehouse ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm kho thành công.", warehouse };
}

export async function updateWarehouseApi(id, payload) {
  const raw = await apiRequest(`/api/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiWarehousePayload(payload)),
  });

  const warehouse = normalizeWarehouseFromApi(raw?.warehouse ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật kho thành công.", warehouse };
}

export async function deleteWarehouseApi(id) {
  return apiRequest(`/api/warehouses/${id}`, { method: "DELETE" });
}

export async function listWarehouseLocationsApi(warehouseId) {
  try {
    const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`);
    return normalizeWarehouseLocationListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createWarehouseLocationApi(warehouseId, payload) {
  const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`, {
    method: "POST",
    body: JSON.stringify(toApiWarehouseLocationPayload(payload)),
  });

  const location = normalizeWarehouseLocationFromApi(raw?.location ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm vị trí lưu trữ thành công.", location };
}

export async function updateWarehouseLocationApi(locationId, payload) {
  const raw = await apiRequest(`/api/warehouse-locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(toApiWarehouseLocationPayload(payload)),
  });

  const location = normalizeWarehouseLocationFromApi(
    raw?.location ?? raw?.data ?? { ...payload, id: locationId }
  );
  return { message: raw?.message || "Cập nhật vị trí lưu trữ thành công.", location };
}

export async function deleteWarehouseLocationApi(locationId) {
  return apiRequest(`/api/warehouse-locations/${locationId}`, { method: "DELETE" });
}
