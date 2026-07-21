import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

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

export async function listRestrictedItemsMock(params = {}) {
  await mockDelay();
  return filterRestrictedItems(getMockStore().restrictedItems, params);
}

export async function createRestrictedItemMock(payload) {
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

export async function updateRestrictedItemMock(id, payload) {
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

export async function deleteRestrictedItemMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.restrictedItems.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy mặt hàng." });
  }

  store.restrictedItems.splice(index, 1);
  return { message: "Đã xóa mặt hàng khỏi danh mục." };
}
