import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";
import { CONSIGNMENT_TYPE_LABELS } from "@/shared/services/orderConsignmentService";
import { ApiError } from "@/shared/utils/apiError";

export { CONSIGNMENT_TYPE_LABELS };

export const SHIPPING_SERVICE_TYPE_LABELS = {
  EXPRESS: "Express",
  STANDARD: "Standard",
  ECONOMY: "Economy",
  FREIGHT: "Freight",
};

export const BILLING_UNIT_LABELS = {
  KG: "Theo kg",
  CBM: "Theo m³ (CBM)",
  KG_OR_CBM: "Kg hoặc CBM (lấy cao hơn)",
};

function buildQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") {
    params.set("isActive", String(isActive));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterPricingRules(items, { search, isActive }) {
  let filtered = items;

  if (isActive === true || isActive === "true") {
    filtered = filtered.filter((item) => item.isActive);
  } else if (isActive === false || isActive === "false") {
    filtered = filtered.filter((item) => !item.isActive);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const serviceLabel =
        SHIPPING_SERVICE_TYPE_LABELS[item.shippingServiceType]?.toLowerCase() || "";
      const route = (item.route || "").toLowerCase();
      return (
        serviceLabel.includes(query) ||
        item.shippingServiceType.toLowerCase().includes(query) ||
        route.includes(query)
      );
    });
  }

  return filtered.map((item) => ({ ...item }));
}

function normalizePricingPayload(payload) {
  return {
    shippingServiceType: payload.shippingServiceType,
    consignmentType: payload.consignmentType,
    route: payload.route?.trim() || null,
    billingUnit: payload.billingUnit,
    pricePerKg: payload.pricePerKg === "" || payload.pricePerKg == null ? null : Number(payload.pricePerKg),
    pricePerCbm: payload.pricePerCbm === "" || payload.pricePerCbm == null ? null : Number(payload.pricePerCbm),
    serviceFee: Number(payload.serviceFee) || 0,
    isActive: payload.isActive !== false,
  };
}

function validatePricingPayload(data) {
  if (!data.shippingServiceType) {
    throw new ApiError(400, { message: "Vui lòng chọn loại dịch vụ vận chuyển." });
  }
  if (!data.consignmentType) {
    throw new ApiError(400, { message: "Vui lòng chọn loại ký gửi." });
  }
  if (!data.billingUnit) {
    throw new ApiError(400, { message: "Vui lòng chọn đơn vị tính phí." });
  }
  if (data.billingUnit !== "CBM" && (data.pricePerKg == null || Number.isNaN(data.pricePerKg))) {
    throw new ApiError(400, { message: "Vui lòng nhập giá theo cân nặng." });
  }
  if (data.billingUnit !== "KG" && (data.pricePerCbm == null || Number.isNaN(data.pricePerCbm))) {
    throw new ApiError(400, { message: "Vui lòng nhập giá theo thể tích." });
  }
}

async function listPricingRulesMock(params = {}) {
  await mockDelay();
  return filterPricingRules(getMockStore().pricingRules, params);
}

async function createPricingRuleMock(payload) {
  await mockDelay();
  const data = normalizePricingPayload(payload);
  validatePricingPayload(data);

  const item = { id: nextMockId("PR"), ...data };
  getMockStore().pricingRules.unshift(item);
  return { message: "Thêm cấu hình giá thành công.", item: { ...item } };
}

async function updatePricingRuleMock(id, payload) {
  await mockDelay();
  const item = getMockStore().pricingRules.find((entry) => entry.id === id);
  if (!item) throw new ApiError(404, { message: "Không tìm thấy cấu hình giá." });

  const data = normalizePricingPayload({ ...item, ...payload });
  validatePricingPayload(data);
  Object.assign(item, data);

  return { message: "Cập nhật cấu hình giá thành công.", item: { ...item } };
}

async function deletePricingRuleMock(id) {
  await mockDelay();
  const store = getMockStore();
  const index = store.pricingRules.findIndex((entry) => entry.id === id);
  if (index < 0) throw new ApiError(404, { message: "Không tìm thấy cấu hình giá." });
  store.pricingRules.splice(index, 1);
  return { message: "Đã xóa cấu hình giá." };
}

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listPricingRules(params = {}) {
  if (isMockMode()) return listPricingRulesMock(params);
  return apiRequest(`/api/pricing-rules${buildQuery(params)}`);
}

export async function createPricingRule(payload) {
  if (isMockMode()) return createPricingRuleMock(payload);
  return apiRequest("/api/pricing-rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePricingRule(id, payload) {
  if (isMockMode()) return updatePricingRuleMock(id, payload);
  return apiRequest(`/api/pricing-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePricingRule(id) {
  if (isMockMode()) return deletePricingRuleMock(id);
  return apiRequest(`/api/pricing-rules/${id}`, { method: "DELETE" });
}

export function formatPricingRoute(route) {
  return route || "Tất cả tuyến";
}

export function formatMoney(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${Number(value).toFixed(2)}`;
}
