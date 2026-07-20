import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  normalizeWarehouseLocationFromApi,
  normalizeWarehouseLocationListResponse,
  toApiWarehouseLocationPayload,
  toApiWarehousePayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";

/** Giá trị khớp API (`Origin` / `Destination`), không có endpoint danh mục riêng. */
export const WAREHOUSE_TYPE_LABELS = {
  Origin: "Kho xuất phát",
  Destination: "Kho đích",
};

export const LOCATION_TYPE_LABELS = {
  ZONE: "Zone",
  SHELF: "Shelf",
  BIN: "Bin",
};

function buildWarehouseQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterWarehouses(items, { search, isActive }) {
  let filtered = items;

  if (isActive === true || isActive === "true") {
    filtered = filtered.filter((item) => item.isActive);
  } else if (isActive === false || isActive === "false") {
    filtered = filtered.filter((item) => !item.isActive);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
    );
  }

  return filtered.map((item) => ({ ...item }));
}

function validateWarehousePayload(payload, { requireAll = false } = {}) {
  const name = payload.name?.trim();
  const code = payload.code?.trim();

  if (requireAll || payload.name !== undefined) {
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên kho." });
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) throw new ApiError(400, { message: "Vui lòng nhập mã kho." });
  }

  return {
    name,
    code,
    address: payload.address?.trim() || null,
    region: payload.region?.trim().toUpperCase() || null,
    warehouseType: payload.warehouseType || null,
    isActive: payload.isActive !== false,
  };
}

function validateLocationPayload(payload, { requireAll = false } = {}) {
  const code = payload.code?.trim();
  const name = payload.name?.trim();

  if (requireAll || payload.locationType !== undefined) {
    if (!payload.locationType) {
      throw new ApiError(400, { message: "Vui lòng chọn loại vị trí." });
    }
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) throw new ApiError(400, { message: "Vui lòng nhập mã vị trí." });
  }
  if (requireAll || payload.name !== undefined) {
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên vị trí." });
  }

  return {
    locationType: payload.locationType,
    code,
    name,
    parentId: payload.parentId || null,
    capacity:
      payload.capacity === "" || payload.capacity == null
        ? null
        : Number(payload.capacity),
    isActive: payload.isActive !== false,
  };
}

async function listWarehousesMock(params = {}) {
  await mockDelay();
  return filterWarehouses(getMockStore().warehouses, params);
}

async function createWarehouseMock(payload) {
  await mockDelay();

  const data = validateWarehousePayload(payload, { requireAll: true });
  const duplicate = getMockStore().warehouses.find(
    (item) => item.code.toLowerCase() === data.code.toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã kho đã tồn tại." });
  }

  const item = { id: nextMockId("WH"), ...data };
  getMockStore().warehouses.unshift(item);
  return { message: "Thêm kho thành công.", warehouse: { ...item } };
}

async function updateWarehouseMock(id, payload) {
  await mockDelay();

  const item = getMockStore().warehouses.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy kho." });
  }

  if (payload.code !== undefined) {
    const code = payload.code.trim();
    const duplicate = getMockStore().warehouses.find(
      (entry) => entry.id !== id && entry.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, { message: "Mã kho đã tồn tại." });
    }
  }

  const data = validateWarehousePayload({ ...item, ...payload });
  Object.assign(item, data);

  return { message: "Cập nhật kho thành công.", warehouse: { ...item } };
}

async function deleteWarehouseMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.warehouses.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy kho." });
  }

  const hasNotes = store.warehouseReceivingNotes.some((note) => note.warehouseId === id);
  if (hasNotes) {
    throw new ApiError(400, {
      message: "Không thể xóa kho đã có phiếu tiếp nhận. Vui lòng vô hiệu hóa thay thế.",
    });
  }

  store.warehouses.splice(index, 1);
  store.warehouseLocations = store.warehouseLocations.filter(
    (location) => location.warehouseId !== id
  );

  return { message: "Đã xóa kho." };
}

async function listWarehouseLocationsMock(warehouseId) {
  await mockDelay();

  const warehouse = getMockStore().warehouses.find((entry) => entry.id === warehouseId);
  if (!warehouse) {
    throw new ApiError(404, { message: "Không tìm thấy kho." });
  }

  return getMockStore()
    .warehouseLocations.filter((location) => location.warehouseId === warehouseId)
    .map((location) => ({ ...location }));
}

async function createWarehouseLocationMock(warehouseId, payload) {
  await mockDelay();

  const warehouse = getMockStore().warehouses.find((entry) => entry.id === warehouseId);
  if (!warehouse) {
    throw new ApiError(404, { message: "Không tìm thấy kho." });
  }

  const data = validateLocationPayload(payload, { requireAll: true });
  const item = {
    id: nextMockId("LOC"),
    warehouseId,
    ...data,
  };

  getMockStore().warehouseLocations.unshift(item);
  return { message: "Thêm vị trí lưu trữ thành công.", location: { ...item } };
}

async function updateWarehouseLocationMock(locationId, payload) {
  await mockDelay();

  const item = getMockStore().warehouseLocations.find((entry) => entry.id === locationId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy vị trí lưu trữ." });
  }

  const data = validateLocationPayload({ ...item, ...payload });
  Object.assign(item, data);

  return { message: "Cập nhật vị trí lưu trữ thành công.", location: { ...item } };
}

async function deleteWarehouseLocationMock(locationId) {
  await mockDelay();

  const store = getMockStore();
  const index = store.warehouseLocations.findIndex((entry) => entry.id === locationId);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy vị trí lưu trữ." });
  }

  const locationIdSet = new Set([locationId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const location of store.warehouseLocations) {
      if (location.parentId && locationIdSet.has(location.parentId) && !locationIdSet.has(location.id)) {
        locationIdSet.add(location.id);
        changed = true;
      }
    }
  }

  store.warehouseLocations = store.warehouseLocations.filter(
    (location) => !locationIdSet.has(location.id)
  );

  return { message: "Đã xóa vị trí lưu trữ." };
}

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listWarehouses(params = {}) {
  if (isMockMode()) return listWarehousesMock(params);

  const raw = await apiRequest(`/api/warehouses${buildWarehouseQuery(params)}`);
  return normalizeWarehouseListResponse(raw);
}

export async function createWarehouse(payload) {
  if (isMockMode()) return createWarehouseMock(payload);

  const raw = await apiRequest("/api/warehouses", {
    method: "POST",
    body: JSON.stringify(toApiWarehousePayload(payload)),
  });

  const warehouse = normalizeWarehouseFromApi(raw?.warehouse ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm kho thành công.", warehouse };
}

export async function updateWarehouse(id, payload) {
  if (isMockMode()) return updateWarehouseMock(id, payload);

  const raw = await apiRequest(`/api/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiWarehousePayload(payload)),
  });

  const warehouse = normalizeWarehouseFromApi(raw?.warehouse ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật kho thành công.", warehouse };
}

export async function deleteWarehouse(id) {
  if (isMockMode()) return deleteWarehouseMock(id);

  return apiRequest(`/api/warehouses/${id}`, { method: "DELETE" });
}

export async function listWarehouseLocations(warehouseId) {
  if (isMockMode()) return listWarehouseLocationsMock(warehouseId);

  try {
    const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`);
    return normalizeWarehouseLocationListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createWarehouseLocation(warehouseId, payload) {
  if (isMockMode()) return createWarehouseLocationMock(warehouseId, payload);

  const raw = await apiRequest(`/api/warehouses/${warehouseId}/locations`, {
    method: "POST",
    body: JSON.stringify(toApiWarehouseLocationPayload(payload)),
  });

  const location = normalizeWarehouseLocationFromApi(raw?.location ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm vị trí lưu trữ thành công.", location };
}

export async function updateWarehouseLocation(locationId, payload) {
  if (isMockMode()) return updateWarehouseLocationMock(locationId, payload);

  const raw = await apiRequest(`/api/warehouse-locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(toApiWarehouseLocationPayload(payload)),
  });

  const location = normalizeWarehouseLocationFromApi(
    raw?.location ?? raw?.data ?? { ...payload, id: locationId }
  );
  return { message: raw?.message || "Cập nhật vị trí lưu trữ thành công.", location };
}

export async function deleteWarehouseLocation(locationId) {
  if (isMockMode()) return deleteWarehouseLocationMock(locationId);

  return apiRequest(`/api/warehouse-locations/${locationId}`, { method: "DELETE" });
}

export function formatWarehouseType(type) {
  if (!type) return "—";
  if (WAREHOUSE_TYPE_LABELS[type]) return WAREHOUSE_TYPE_LABELS[type];
  const match = Object.entries(WAREHOUSE_TYPE_LABELS).find(
    ([value]) => value.toLowerCase() === String(type).toLowerCase()
  );
  return match?.[1] || type;
}

export function formatLocationType(type) {
  return LOCATION_TYPE_LABELS[type] || type || "—";
}

export function getParentLocationLabel(locations, parentId) {
  if (!parentId) return "—";
  const parent = locations.find((item) => item.id === parentId);
  return parent ? `${parent.code} — ${parent.name}` : parentId;
}
