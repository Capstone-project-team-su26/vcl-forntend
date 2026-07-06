import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeCarrierFromApi,
  normalizeCarrierListResponse,
  toApiCarrierPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";

export const CARRIER_TYPE_OPTIONS = [
  { value: "CARRIER", label: "Đơn vị vận chuyển" },
  { value: "FORWARDER", label: "Forwarder" },
  { value: "LOGISTICS_PARTNER", label: "Đối tác logistics" },
];

export const CARRIER_TYPE_LABELS = Object.fromEntries(
  CARRIER_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

function buildQuery({ search, isActive, activeOnly }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  if (activeOnly) params.set("activeOnly", "true");
  const query = params.toString();
  return query ? `?${query}` : "";
}

function parseListInput(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value)
    .split(/[,;\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function filterCarriers(items, { search, isActive, activeOnly }) {
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

function validateCarrierPayload(payload, { requireAll = false } = {}) {
  const name = payload.name?.trim();
  const code = payload.code?.trim();
  const carrierType = payload.carrierType?.trim() || "CARRIER";

  if (requireAll || payload.name !== undefined) {
    if (!name) {
      throw new ApiError(400, { message: "Vui lòng nhập tên đơn vị vận chuyển." });
    }
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) {
      throw new ApiError(400, { message: "Vui lòng nhập mã đơn vị vận chuyển." });
    }
  }

  return {
    name,
    code,
    carrierType,
    supportedShippingMethods: parseListInput(payload.supportedShippingMethods),
    supportedCountriesRegions: parseListInput(payload.supportedCountriesRegions),
    contactInfo: payload.contactInfo?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

async function listCarriersMock(params = {}) {
  await mockDelay();
  return filterCarriers(getMockStore().carriers, params);
}

async function createCarrierMock(payload) {
  await mockDelay();

  const data = validateCarrierPayload(payload, { requireAll: true });
  const duplicate = getMockStore().carriers.find(
    (item) => item.code.toLowerCase() === data.code.toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã đơn vị vận chuyển đã tồn tại." });
  }

  const item = {
    id: nextMockId("CAR"),
    ...data,
  };

  getMockStore().carriers.unshift(item);
  return { message: "Thêm đơn vị vận chuyển thành công.", carrier: { ...item } };
}

async function updateCarrierMock(id, payload) {
  await mockDelay();

  const item = getMockStore().carriers.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy đơn vị vận chuyển." });
  }

  if (payload.code !== undefined) {
    const code = payload.code.trim();
    const duplicate = getMockStore().carriers.find(
      (entry) => entry.id !== id && entry.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, { message: "Mã đơn vị vận chuyển đã tồn tại." });
    }
  }

  const data = validateCarrierPayload({ ...item, ...payload });
  Object.assign(item, data);

  return {
    message: "Cập nhật đơn vị vận chuyển thành công.",
    carrier: { ...item },
  };
}

async function deleteCarrierMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.carriers.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy đơn vị vận chuyển." });
  }

  store.carriers.splice(index, 1);
  return { message: "Đã xóa đơn vị vận chuyển." };
}

/**
 * @param {{ search?: string; isActive?: boolean | string; activeOnly?: boolean }} params
 */
export async function listCarriers(params = {}) {
  const activeOnly = params.activeOnly === true;

  if (isMockMode()) {
    return listCarriersMock({
      search: params.search,
      isActive: params.isActive,
      activeOnly,
    });
  }

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

/** Chỉ lấy carrier đang hoạt động — dùng cho nghiệp vụ Staff/Operations. */
export async function listActiveCarriers(params = {}) {
  return listCarriers({ ...params, activeOnly: true });
}

export async function createCarrier(payload) {
  if (isMockMode()) return createCarrierMock(payload);

  const raw = await apiRequest("/api/carriers", {
    method: "POST",
    body: JSON.stringify(toApiCarrierPayload(payload)),
  });

  const carrier = normalizeCarrierFromApi(raw?.carrier ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm đơn vị vận chuyển thành công.", carrier };
}

export async function updateCarrier(id, payload) {
  if (isMockMode()) return updateCarrierMock(id, payload);

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

export async function deleteCarrier(id) {
  if (isMockMode()) return deleteCarrierMock(id);

  return apiRequest(`/api/carriers/${id}`, { method: "DELETE" });
}
