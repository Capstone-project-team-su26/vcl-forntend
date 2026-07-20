import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

function filterShippingMethods(items, { search, isActive, activeOnly }) {
  let filtered = items;

  if (activeOnly) {
    filtered = filtered.filter((item) => item.isActive);
  } else if (isActive === true || isActive === "true") {
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

function validateShippingMethodPayload(payload, { requireAll = false } = {}) {
  const name = payload.name?.trim();
  const code = payload.code?.trim();

  if (requireAll || payload.name !== undefined) {
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên phương thức vận chuyển." });
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) throw new ApiError(400, { message: "Vui lòng nhập mã phương thức vận chuyển." });
  }

  return {
    name,
    code,
    description: payload.description?.trim() || null,
    estimatedDeliveryTime: payload.estimatedDeliveryTime?.trim() || null,
    applicableConditions: payload.applicableConditions?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export async function listShippingMethodsMock(params = {}) {
  await mockDelay();
  return filterShippingMethods(getMockStore().shippingMethods, params);
}

export async function createShippingMethodMock(payload) {
  await mockDelay();

  const data = validateShippingMethodPayload(payload, { requireAll: true });
  const duplicate = getMockStore().shippingMethods.find(
    (item) => item.code.toLowerCase() === data.code.toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã phương thức vận chuyển đã tồn tại." });
  }

  const item = {
    id: nextMockId("SM"),
    ...data,
    additionalServices: [],
  };

  getMockStore().shippingMethods.unshift(item);
  return { message: "Thêm phương thức vận chuyển thành công.", shippingMethod: { ...item } };
}

export async function updateShippingMethodMock(id, payload) {
  await mockDelay();

  const item = getMockStore().shippingMethods.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy phương thức vận chuyển." });
  }

  if (payload.code !== undefined) {
    const code = payload.code.trim();
    const duplicate = getMockStore().shippingMethods.find(
      (entry) => entry.id !== id && entry.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, { message: "Mã phương thức vận chuyển đã tồn tại." });
    }
  }

  const data = validateShippingMethodPayload({ ...item, ...payload });
  Object.assign(item, data);

  return {
    message: "Cập nhật phương thức vận chuyển thành công.",
    shippingMethod: { ...item },
  };
}

export async function deleteShippingMethodMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.shippingMethods.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy phương thức vận chuyển." });
  }

  store.shippingMethods.splice(index, 1);
  return { message: "Đã xóa phương thức vận chuyển." };
}
