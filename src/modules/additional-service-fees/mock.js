import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

export function filterAdditionalServiceFees(items, { search, isActive }) {
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

export function validateFeePayload(payload, { requireAll = false } = {}) {
  const name = payload.name?.trim();
  const code = payload.code?.trim();
  const feeCalculationType = payload.feeCalculationType || "FIXED";

  if (requireAll || payload.name !== undefined) {
    if (!name) throw new ApiError(400, { message: "Vui lòng nhập tên loại phí." });
  }
  if (requireAll || payload.code !== undefined) {
    if (!code) throw new ApiError(400, { message: "Vui lòng nhập mã loại phí." });
  }

  let fixedAmount = null;
  let percentageRate = null;

  if (feeCalculationType === "FIXED") {
    const value =
      payload.fixedAmount === "" || payload.fixedAmount == null
        ? null
        : Number(payload.fixedAmount);
    if (requireAll && (value == null || Number.isNaN(value) || value < 0)) {
      throw new ApiError(400, { message: "Vui lòng nhập giá cố định hợp lệ." });
    }
    fixedAmount = value;
  }

  if (feeCalculationType === "PERCENTAGE") {
    const value =
      payload.percentageRate === "" || payload.percentageRate == null
        ? null
        : Number(payload.percentageRate);
    if (requireAll && (value == null || Number.isNaN(value) || value < 0 || value > 100)) {
      throw new ApiError(400, { message: "Phần trăm phí phải từ 0 đến 100." });
    }
    percentageRate = value;
  }

  return {
    name,
    code,
    ruleCode: payload.ruleCode?.trim() || code,
    ruleType: payload.ruleType ?? undefined,
    feeCalculationType,
    fixedAmount,
    percentageRate,
    unit: payload.unit?.trim() || null,
    description: payload.description?.trim() || null,
    isActive: payload.isActive !== false,
    isRequired: payload.isRequired === true,
  };
}

export async function listAdditionalServiceFeesMock(params = {}) {
  await mockDelay();
  return filterAdditionalServiceFees(getMockStore().additionalServiceFees, params);
}

export async function createAdditionalServiceFeeMock(payload) {
  await mockDelay();

  const data = validateFeePayload(payload, { requireAll: true });
  const duplicate = getMockStore().additionalServiceFees.find(
    (item) => item.code.toLowerCase() === data.code.toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã loại phí đã tồn tại." });
  }

  const item = { id: nextMockId("ASF"), ...data };
  getMockStore().additionalServiceFees.unshift(item);
  return { message: "Thêm loại phí thành công.", fee: { ...item } };
}

export async function updateAdditionalServiceFeeMock(id, payload) {
  await mockDelay();

  const item = getMockStore().additionalServiceFees.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy loại phí." });
  }

  if (payload.code !== undefined) {
    const code = payload.code.trim();
    const duplicate = getMockStore().additionalServiceFees.find(
      (entry) => entry.id !== id && entry.code.toLowerCase() === code.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, { message: "Mã loại phí đã tồn tại." });
    }
  }

  const data = validateFeePayload({ ...item, ...payload });
  Object.assign(item, data);

  return { message: "Cập nhật loại phí thành công.", fee: { ...item } };
}

export async function deleteAdditionalServiceFeeMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.additionalServiceFees.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy loại phí." });
  }

  store.additionalServiceFees.splice(index, 1);
  return { message: "Đã xóa loại phí dịch vụ bổ sung." };
}
