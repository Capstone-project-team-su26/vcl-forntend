import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeAdditionalServiceFeeFromApi,
  normalizeAdditionalServiceFeeListResponse,
  toApiPricingRuleFromAdditionalFeePayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { formatMoney, isVolumetricDivisorRule } from "@/utils/servicePricingService";

export const FEE_CALCULATION_TYPE_LABELS = {
  FIXED: "Giá cố định",
  PERCENTAGE: "Theo phần trăm",
};

const PRICING_RULES_PATH = "/api/pricing-rules";

function buildQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterAdditionalServiceFees(items, { search, isActive }) {
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

function validateFeePayload(payload, { requireAll = false } = {}) {
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
    feeCalculationType,
    fixedAmount,
    percentageRate,
    unit: payload.unit?.trim() || null,
    description: payload.description?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

async function listAdditionalServiceFeesMock(params = {}) {
  await mockDelay();
  return filterAdditionalServiceFees(getMockStore().additionalServiceFees, params);
}

async function createAdditionalServiceFeeMock(payload) {
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

async function updateAdditionalServiceFeeMock(id, payload) {
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

async function deleteAdditionalServiceFeeMock(id) {
  await mockDelay();

  const store = getMockStore();
  const index = store.additionalServiceFees.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy loại phí." });
  }

  store.additionalServiceFees.splice(index, 1);
  return { message: "Đã xóa loại phí dịch vụ bổ sung." };
}

async function getPricingRuleAsFee(id) {
  const raw = await apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`);
  return normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw);
}

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listAdditionalServiceFees(params = {}) {
  if (isMockMode()) return listAdditionalServiceFeesMock(params);

  const raw = await apiRequest(`${PRICING_RULES_PATH}${buildQuery(params)}`);
  const items = normalizeAdditionalServiceFeeListResponse(raw);
  return filterAdditionalServiceFees(items, params);
}

export async function createAdditionalServiceFee(payload) {
  if (isMockMode()) return createAdditionalServiceFeeMock(payload);

  const data = validateFeePayload(payload, { requireAll: true });
  const raw = await apiRequest(PRICING_RULES_PATH, {
    method: "POST",
    body: JSON.stringify(toApiPricingRuleFromAdditionalFeePayload(data)),
  });

  const fee = normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw?.fee ?? raw);
  return { message: raw?.message || "Thêm loại phí thành công.", fee };
}

export async function updateAdditionalServiceFee(id, payload) {
  if (isMockMode()) return updateAdditionalServiceFeeMock(id, payload);

  const existing = await getPricingRuleAsFee(id);
  const merged = { ...existing, ...validateFeePayload({ ...existing, ...payload }) };

  const raw = await apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(toApiPricingRuleFromAdditionalFeePayload(merged)),
  });

  const fee = normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw?.fee ?? { ...merged, id });
  return { message: raw?.message || "Cập nhật loại phí thành công.", fee };
}

export async function deleteAdditionalServiceFee(id) {
  if (isMockMode()) return deleteAdditionalServiceFeeMock(id);

  return apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function formatFeeAmount(fee) {
  if (isVolumetricDivisorRule(fee)) {
    const value = Number(fee.fixedAmount ?? fee.value);
    return Number.isFinite(value) && value > 0
      ? `÷ ${value.toLocaleString("vi-VN")}`
      : "—";
  }
  if (fee.feeCalculationType === "PERCENTAGE") {
    return fee.percentageRate != null ? `${fee.percentageRate}%` : "—";
  }
  return fee.fixedAmount != null ? formatMoney(fee.fixedAmount) : "—";
}

export function formatFeeCalculationType(type, fee) {
  if (fee && isVolumetricDivisorRule(fee)) return "Hệ số quy đổi thể tích";
  return FEE_CALCULATION_TYPE_LABELS[type] || type || "—";
}
