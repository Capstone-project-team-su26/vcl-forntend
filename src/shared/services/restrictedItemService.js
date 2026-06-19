import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";
import { ApiError } from "@/shared/utils/apiError";

export const RESTRICTION_TYPE_LABELS = {
  PROHIBITED: "Cấm tuyệt đối",
  RESTRICTED: "Hạn chế",
  CONDITIONAL: "Có điều kiện",
};

function buildQuery({ search, restrictionType }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (restrictionType) params.set("restrictionType", restrictionType);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterRestrictedItems(items, { search, restrictionType }) {
  let filtered = items;

  if (restrictionType) {
    filtered = filtered.filter((item) => item.restrictionType === restrictionType);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(query));
  }

  return filtered.map((item) => ({ ...item }));
}

async function listRestrictedItemsMock(params = {}) {
  await mockDelay();
  return filterRestrictedItems(getMockStore().restrictedItems, params);
}

async function createRestrictedItemMock(payload) {
  await mockDelay();

  const name = payload.name?.trim();
  if (!name) {
    throw new ApiError(400, { message: "Vui lòng nhập tên mặt hàng." });
  }

  const item = {
    id: nextMockId("RI"),
    name,
    country: payload.country?.trim() || null,
    restrictionType: payload.restrictionType || "RESTRICTED",
    notes: payload.notes?.trim() || "",
    isActive: payload.isActive !== false,
  };

  getMockStore().restrictedItems.unshift(item);
  return { message: "Thêm mặt hàng thành công.", item: { ...item } };
}

async function updateRestrictedItemMock(id, payload) {
  await mockDelay();

  const item = getMockStore().restrictedItems.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy mặt hàng." });
  }

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên mặt hàng." });
    item.name = name;
  }
  if (payload.country !== undefined) item.country = payload.country?.trim() || null;
  if (payload.restrictionType !== undefined) item.restrictionType = payload.restrictionType;
  if (payload.notes !== undefined) item.notes = payload.notes?.trim() || "";
  if (payload.isActive !== undefined) item.isActive = Boolean(payload.isActive);

  return { message: "Cập nhật mặt hàng thành công.", item: { ...item } };
}

async function deleteRestrictedItemMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.restrictedItems.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy mặt hàng." });
  }

  store.restrictedItems.splice(index, 1);
  return { message: "Đã xóa mặt hàng khỏi danh mục." };
}

/**
 * @param {{ search?: string; restrictionType?: string }} params
 */
export async function listRestrictedItems(params = {}) {
  if (isMockMode()) return listRestrictedItemsMock(params);

  return apiRequest(`/api/restricted-items${buildQuery(params)}`);
}

export async function createRestrictedItem(payload) {
  if (isMockMode()) return createRestrictedItemMock(payload);

  return apiRequest("/api/restricted-items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRestrictedItem(id, payload) {
  if (isMockMode()) return updateRestrictedItemMock(id, payload);

  return apiRequest(`/api/restricted-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRestrictedItem(id) {
  if (isMockMode()) return deleteRestrictedItemMock(id);

  return apiRequest(`/api/restricted-items/${id}`, {
    method: "DELETE",
  });
}

export function formatRestrictedCountry(country) {
  if (!country) return "Tất cả quốc gia";
  return country;
}
