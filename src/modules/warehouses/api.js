import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  normalizeWarehouseLocationFromApi,
  normalizeStorageLocationFromApi,
  normalizeStorageLocationListResponse,
  normalizeLayoutListResponse,
  normalizeOneLayoutCellResponse,
  toApiWarehouseLocationPayload,
  toApiCreateStorageLocationPayload,
  toApiWarehousePayload,
  toApiLayoutPayload,
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

/** Tất cả role — dùng cho Ops / Sales picker. */
export async function listActiveWarehousesApi() {
  const raw = await apiRequest("/api/warehouses/active");
  return normalizeWarehouseListResponse(raw).filter((entry) => entry.isActive !== false);
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
    return normalizeStorageLocationListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function listActiveWarehouseLocationsApi(warehouseId) {
  try {
    const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations/active`);
    return normalizeStorageLocationListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createStorageLocationApi(warehouseId, payload) {
  const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`, {
    method: "POST",
    body: JSON.stringify(toApiCreateStorageLocationPayload(payload)),
  });

  const location = normalizeStorageLocationFromApi(raw?.location ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm vị trí lưu trữ thành công.", location };
}

export async function createWarehouseLocationApi(warehouseId, payload) {
  // Legacy ZONE/SHELF/BIN form — ưu tiên DTO mới nếu có binCode.
  if (payload?.binCode || payload?.zoneName || payload?.shelfCode) {
    return createStorageLocationApi(warehouseId, payload);
  }

  const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`, {
    method: "POST",
    body: JSON.stringify(toApiWarehouseLocationPayload(payload)),
  });

  const location = normalizeWarehouseLocationFromApi(raw?.location ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm vị trí lưu trữ thành công.", location };
}

export async function updateWarehouseLocationApi(locationId, payload) {
  // BE PUT dùng CreateLocationRequestDto (zoneName/shelfCode/binCode…) — không gửi field legacy.
  const body =
    payload?.binCode != null || payload?.zoneName != null || payload?.shelfCode != null
      ? toApiCreateStorageLocationPayload(payload)
      : toApiWarehouseLocationPayload(payload);

  const raw = await apiRequest(`/api/warehouse-locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const location = normalizeWarehouseLocationFromApi(
    raw?.location ?? raw?.data ?? { ...payload, id: locationId }
  );
  return { message: raw?.message || "Cập nhật vị trí lưu trữ thành công.", location };
}

export async function deleteWarehouseLocationApi(locationId) {
  return apiRequest(`/api/warehouse-locations/${locationId}`, { method: "DELETE" });
}

export async function listWarehouseLayoutApi(warehouseId) {
  try {
    const raw = await apiRequest(`/api/warehouses/${warehouseId}/layout`);
    return normalizeLayoutListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function listWarehouseLayoutStatusApi(warehouseId) {
  try {
    const raw = await apiRequest(`/api/warehouses/${warehouseId}/layout/status`);
    return normalizeLayoutListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createWarehouseLayoutCellApi(warehouseId, payload) {
  const raw = await apiRequest(`/api/warehouses/${warehouseId}/layout`, {
    method: "POST",
    body: JSON.stringify(toApiLayoutPayload(payload)),
  });
  const cell = normalizeOneLayoutCellResponse(raw);
  return { message: raw?.message || "Đã thêm ô sơ đồ.", cell };
}

export async function updateWarehouseLayoutCellApi(warehouseId, layoutId, payload) {
  const raw = await apiRequest(`/api/warehouses/${warehouseId}/layout/${layoutId}`, {
    method: "PUT",
    body: JSON.stringify(toApiLayoutPayload(payload)),
  });
  const cell =
    normalizeOneLayoutCellResponse(raw) ??
    normalizeOneLayoutCellResponse({ ...toApiLayoutPayload(payload), id: layoutId });
  return { message: raw?.message || "Đã cập nhật ô sơ đồ.", cell };
}

export async function deleteWarehouseLayoutCellApi(warehouseId, layoutId) {
  return apiRequest(`/api/warehouses/${warehouseId}/layout/${layoutId}`, {
    method: "DELETE",
  });
}
