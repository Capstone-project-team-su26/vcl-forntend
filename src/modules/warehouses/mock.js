import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

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

export async function listWarehousesMock(params = {}) {
  await mockDelay();
  return filterWarehouses(getMockStore().warehouses, params);
}

export async function createWarehouseMock(payload) {
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

export async function updateWarehouseMock(id, payload) {
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

export async function deleteWarehouseMock(id) {
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

export async function listWarehouseLocationsMock(warehouseId) {
  await mockDelay();

  const warehouse = getMockStore().warehouses.find((entry) => entry.id === warehouseId);
  if (!warehouse) {
    throw new ApiError(404, { message: "Không tìm thấy kho." });
  }

  return getMockStore()
    .warehouseLocations.filter((location) => location.warehouseId === warehouseId)
    .map((location) => ({ ...location }));
}

export async function createWarehouseLocationMock(warehouseId, payload) {
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

export async function updateWarehouseLocationMock(locationId, payload) {
  await mockDelay();

  const item = getMockStore().warehouseLocations.find((entry) => entry.id === locationId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy vị trí lưu trữ." });
  }

  const data = validateLocationPayload({ ...item, ...payload });
  Object.assign(item, data);

  return { message: "Cập nhật vị trí lưu trữ thành công.", location: { ...item } };
}

export async function deleteWarehouseLocationMock(locationId) {
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
