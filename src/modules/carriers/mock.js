import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

const CARRIER_TYPES = ["CARRIER", "FORWARDER"];

function normalizeSupportedShippingMethods(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
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
  const type = payload.type?.trim()?.toUpperCase();

  if (requireAll || payload.name !== undefined) {
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên đơn vị vận chuyển." });
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) throw new ApiError(400, { message: "Vui lòng nhập mã đơn vị vận chuyển." });
  }
  if (requireAll || payload.type !== undefined) {
    if (!type || !CARRIER_TYPES.includes(type)) {
      throw new ApiError(400, { message: "Vui lòng chọn loại đơn vị vận chuyển hợp lệ." });
    }
  }

  return {
    name,
    code,
    type: type && CARRIER_TYPES.includes(type) ? type : payload.type,
    supportedShippingMethods: normalizeSupportedShippingMethods(
      payload.supportedShippingMethods
    ),
    supportedRegions: payload.supportedRegions?.trim() || null,
    contactInfo: payload.contactInfo?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export async function listCarriersMock(params = {}) {
  await mockDelay();
  return filterCarriers(getMockStore().carriers, params);
}

export async function createCarrierMock(payload) {
  await mockDelay();

  const data = validateCarrierPayload(payload, { requireAll: true });
  const duplicate = getMockStore().carriers.find(
    (item) => item.code.toLowerCase() === data.code.toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã đơn vị vận chuyển đã tồn tại." });
  }

  const item = {
    id: nextMockId("CR"),
    ...data,
  };

  getMockStore().carriers.unshift(item);
  return { message: "Thêm đơn vị vận chuyển thành công.", carrier: { ...item } };
}

export async function updateCarrierMock(id, payload) {
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

export async function deleteCarrierMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.carriers.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy đơn vị vận chuyển." });
  }

  store.carriers.splice(index, 1);
  return { message: "Đã xóa đơn vị vận chuyển." };
}
