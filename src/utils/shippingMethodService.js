import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeShippingMethodFromApi,
  normalizeShippingMethodListResponse,
  toApiShippingMethodPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";

function buildQuery({ search, isActive, activeOnly }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  if (activeOnly) params.set("activeOnly", "true");
  const query = params.toString();
  return query ? `?${query}` : "";
}

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

async function listShippingMethodsMock(params = {}) {
  await mockDelay();
  return filterShippingMethods(getMockStore().shippingMethods, params);
}

async function createShippingMethodMock(payload) {
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

async function updateShippingMethodMock(id, payload) {
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

async function deleteShippingMethodMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.shippingMethods.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy phương thức vận chuyển." });
  }

  store.shippingMethods.splice(index, 1);
  return { message: "Đã xóa phương thức vận chuyển." };
}

/**
 * @param {{ search?: string; isActive?: boolean | string; activeOnly?: boolean }} params
 */
export async function listShippingMethods(params = {}) {
  const activeOnly = params.activeOnly === true;

  if (isMockMode()) {
    return listShippingMethodsMock({
      search: params.search,
      isActive: params.isActive,
      activeOnly,
    });
  }

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

export async function createShippingMethod(payload) {
  if (isMockMode()) return createShippingMethodMock(payload);

  const raw = await apiRequest("/api/shipping-methods", {
    method: "POST",
    body: JSON.stringify(toApiShippingMethodPayload(payload)),
  });

  const shippingMethod = normalizeShippingMethodFromApi(
    raw?.shippingMethod ?? raw?.data ?? raw
  );
  return { message: raw?.message || "Thêm phương thức vận chuyển thành công.", shippingMethod };
}

export async function updateShippingMethod(id, payload) {
  if (isMockMode()) return updateShippingMethodMock(id, payload);

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

export async function deleteShippingMethod(id) {
  if (isMockMode()) return deleteShippingMethodMock(id);

  return apiRequest(`/api/shipping-methods/${id}`, { method: "DELETE" });
}
