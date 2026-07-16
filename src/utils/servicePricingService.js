import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeServicePricingFromApi,
  normalizeWarehouseListResponse,
  toApiServicePricingPayload,
  extractGuid,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";

export const DEFAULT_CURRENCY = "VND";

export const SERVICE_TYPE_LABELS = {
  EXPRESS: "Express",
  STANDARD: "Standard",
  ECONOMY: "Economy",
  FREIGHT: "Freight",
  CONSOLIDATION: "Consolidation",
};

export const UNIT_TYPE_LABELS = {
  KG: "Theo kg",
  CBM: "Theo cm³",
  KG_OR_CBM: "Kg hoặc cm³ (lấy cao hơn)",
};

/**
 * Hệ số DIM mặc định (IATA) — khớp BE khi chưa có PricingRule `VOLUMETRIC_DIVISOR`.
 * Công thức: VolumetricWeight = TotalVolume(cm³) / divisor.
 */
export const VOLUMETRIC_DIVISOR_CM3 = 5000;
export const VOLUMETRIC_DIVISOR_RULE = "VOLUMETRIC_DIVISOR";

/** @deprecated dùng VOLUMETRIC_DIVISOR_CM3; giữ để tương thích chỗ còn nhắc m³. */
export const VOLUMETRIC_FACTOR_M3 = 1_000_000 / VOLUMETRIC_DIVISOR_CM3;

/** Quy tắc cấu hình (không phải phụ phí tính tiền). */
const PRICING_CONFIG_RULES = new Set([
  VOLUMETRIC_DIVISOR_RULE,
  "MIN_WEIGHT",
  "DOMESTIC_FEE",
]);

function ruleKey(fee) {
  return String(fee?.ruleType ?? fee?.code ?? fee?.ruleCode ?? "")
    .trim()
    .toUpperCase();
}

export function isPricingConfigRule(fee) {
  const key = ruleKey(fee);
  if (PRICING_CONFIG_RULES.has(key)) return true;
  const code = String(fee?.ruleCode ?? fee?.code ?? "").toUpperCase();
  return PRICING_CONFIG_RULES.has(code) || code.includes(VOLUMETRIC_DIVISOR_RULE);
}

export function isVolumetricDivisorRule(fee) {
  const key = ruleKey(fee);
  const code = String(fee?.ruleCode ?? fee?.code ?? "").toUpperCase();
  return key === VOLUMETRIC_DIVISOR_RULE || code.includes(VOLUMETRIC_DIVISOR_RULE);
}

/** Lấy hệ số quy đổi thể tích từ danh sách PricingRule / fee catalog. */
export function resolveVolumetricDivisor(rules = []) {
  const rule = (Array.isArray(rules) ? rules : []).find(isVolumetricDivisorRule);
  if (!rule) return VOLUMETRIC_DIVISOR_CM3;

  const raw =
    rule.fixedAmount ?? rule.value ?? rule.percentageRate ?? rule.conditionValue;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : VOLUMETRIC_DIVISOR_CM3;
}

function normalizeDivisor(divisor) {
  const value = Number(divisor);
  return Number.isFinite(value) && value > 0 ? value : VOLUMETRIC_DIVISOR_CM3;
}

function normalizeUnitType(raw) {
  const upper = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (!upper) return null;
  if (upper === "KG" || upper === "KILOGRAM") return "KG";
  // ponytail: BE vẫn có thể trả CBM/M3; FE chuẩn hóa về CBM và label là cm³.
  if (upper === "CBM" || upper === "CM3" || upper === "CM³" || upper === "M3" || upper === "M³") {
    return "CBM";
  }
  if (
    (upper.includes("KG") && upper.includes("CBM")) ||
    (upper.includes("KG") && upper.includes("CM3"))
  ) {
    return "KG_OR_CBM";
  }
  return upper;
}

export function isConfiguredServicePricing(servicePricing) {
  if (!servicePricing?.id) return false;

  const unitType = normalizeUnitType(servicePricing.unitType);
  if (unitType === "KG") return (Number(servicePricing.price) || 0) > 0;
  if (unitType === "CBM") return (Number(servicePricing.price) || 0) > 0;
  if (unitType === "KG_OR_CBM") {
    const pricePerKg = Number(servicePricing.pricePerKg ?? servicePricing.price) || 0;
    const pricePerCbm = Number(servicePricing.pricePerCbm ?? servicePricing.price) || 0;
    return pricePerKg > 0 || pricePerCbm > 0;
  }

  return (Number(servicePricing.price) || 0) > 0;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function buildQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") {
    params.set("isActive", String(isActive));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterServicePricings(items, { search, isActive }) {
  let filtered = items;

  if (isActive === true || isActive === "true") {
    filtered = filtered.filter((item) => item.isActive);
  } else if (isActive === false || isActive === "false") {
    filtered = filtered.filter((item) => !item.isActive);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const haystack = [
        item.carrierId,
        item.carrierName,
        item.serviceType,
        item.originCountry,
        item.destinationCountry,
        item.warehouseId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return filtered.map((item) => ({ ...item }));
}

function formatKg(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;
}

function formatM3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 4 })} m³`;
}

function formatCm3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} cm³`;
}

export function formatVolumeCm3(value) {
  return formatCm3(value);
}

export function volumeM3ToCm3(volumeM3) {
  return roundMoney((Number(volumeM3) || 0) * 1_000_000);
}

export function volumeCm3ToM3(volumeCm3) {
  return (Number(volumeCm3) || 0) / 1_000_000;
}

/** BE `totalVolume` = cm³ (Swagger). */
export function normalizeVolumeCm3FromApi(raw, { weightKg } = {}) {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;

  // ponytail: bản ghi cũ bị FE ×1e6 (coi cm³ là m³ rồi volumeM3ToCm3) — VD 16 → 16_000_000.
  if (n >= 1_000_000) {
    const undone = n / 1_000_000;
    const dimRaw = n / VOLUMETRIC_DIVISOR_CM3;
    const dimUndone = undone / VOLUMETRIC_DIVISOR_CM3;
    const weight = Number(weightKg) || 0;
    const absurdVsWeight =
      weight > 0 && dimRaw > Math.max(weight * 50, 50) && dimUndone <= Math.max(weight * 50, 50);
    const tinyAfterUndo = weight <= 0 && undone > 0 && undone < 100_000;
    if (absurdVsWeight || tinyAfterUndo) return undone;
  }

  return n;
}

/** Ưu tiên volumeCm3; `volumeM3` chỉ còn cho legacy caller. */
function resolveVolumeCm3({ volumeCm3, volumeM3 } = {}) {
  if (volumeCm3 != null && volumeCm3 !== "") return Number(volumeCm3) || 0;
  if (volumeM3 != null && volumeM3 !== "") return volumeM3ToCm3(volumeM3);
  return 0;
}

/** Cân DIM theo kích thước từng kiện (cm) — L×W×H÷divisor (không làm tròn). */
export function calculateItemDimWeightKg(length, width, height, divisor = VOLUMETRIC_DIVISOR_CM3) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (!l || !w || !h) return null;
  return (l * w * h) / normalizeDivisor(divisor);
}

export function formatItemDimensions(length, width, height) {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  if (!l || !w || !h) return null;
  return `${l} × ${w} × ${h} cm`;
}

/** Tổng thể tích đơn (cm³) — dùng thẳng giá trị API, KHÔNG tự nhân quantity. */
export function resolveConsignmentTotalVolumeCm3({ totalVolume, weightKg } = {}) {
  return normalizeVolumeCm3FromApi(totalVolume, { weightKg });
}

export function formatItemDimFormula(length, width, height, divisor = VOLUMETRIC_DIVISOR_CM3) {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  const dim = normalizeDivisor(divisor);
  const dimKg = calculateItemDimWeightKg(l, w, h, dim);
  if (dimKg == null) return null;
  const dimLabel = dimKg.toLocaleString("vi-VN", {
    maximumFractionDigits: 6,
  });
  return `(${l} × ${w} × ${h}) / ${dim.toLocaleString("vi-VN")} = ${dimLabel} kg`;
}

/** DIM (kg) = thể tích cm³ ÷ hệ số quy đổi — không làm tròn. */
export function calculateVolumetricWeight(volumeCm3, divisor = VOLUMETRIC_DIVISOR_CM3) {
  return (Number(volumeCm3) || 0) / normalizeDivisor(divisor);
}

export function calculateChargeableWeight(weightKg, volumeCm3, divisor = VOLUMETRIC_DIVISOR_CM3) {
  const weight = Number(weightKg) || 0;
  const volumetric = calculateVolumetricWeight(volumeCm3, divisor);
  return Math.max(weight, volumetric);
}

export function calculateMainServiceAmount(
  servicePricing,
  { weightKg = 0, volumeCm3, volumeM3, volumetricDivisor } = {}
) {
  if (!servicePricing) return 0;

  const volume = resolveVolumeCm3({ volumeCm3, volumeM3 });
  const chargeable = calculateChargeableWeight(weightKg, volume, volumetricDivisor);
  const price = Number(servicePricing.price) || 0;
  const unitType = normalizeUnitType(servicePricing.unitType);

  switch (unitType) {
    case "KG":
      return roundMoney(chargeable * price);
    case "CBM":
      return roundMoney(volume * price);
    case "KG_OR_CBM": {
      const byKg = chargeable * (Number(servicePricing.pricePerKg ?? price) || 0);
      const byCbm = volume * (Number(servicePricing.pricePerCbm ?? price) || 0);
      return roundMoney(Math.max(byKg, byCbm));
    }
    default:
      return 0;
  }
}

/**
 * Diễn giải từng bước tính cước dịch vụ chính.
 * - Có bảng giá BE: hiển thị đơn giá thật.
 * - DIM dùng hệ số quy đổi thể tích (PricingRule VOLUMETRIC_DIVISOR, mặc định 5000).
 */
export function buildMainServicePricingBreakdown(
  servicePricing,
  {
    weightKg = 0,
    volumeCm3: volumeCm3Input,
    volumeM3 = 0,
    estimate = null,
    volumetricDivisor,
  } = {}
) {
  const divisor = normalizeDivisor(volumetricDivisor);
  const weight = Number(weightKg) || 0;
  const volumeCm3Value = resolveVolumeCm3({
    volumeCm3: volumeCm3Input,
    volumeM3,
  });
  const hasWeight = weight > 0;
  const hasVolume = volumeCm3Value > 0;
  const hasConfiguredPricing = isConfiguredServicePricing(servicePricing);
  const unitType = normalizeUnitType(servicePricing?.unitType);

  const volumeCm3 = hasVolume ? volumeCm3Value : null;
  const localVolumetric = hasVolume ? calculateVolumetricWeight(volumeCm3Value, divisor) : 0;
  const localChargeable = hasVolume
    ? calculateChargeableWeight(weightKg, volumeCm3Value, divisor)
    : weight;

  // ponytail: có volume cm³ thì tự tính DIM theo hệ số. Không tin estimate.volumetricWeight —
  // BE từng nhân volume như m³ (×200) → ra số kg lệch lớn so với cân thực.
  const volumetricWeight = localVolumetric > 0 ? localVolumetric : 0;
  const chargeableWeight =
    hasVolume || hasWeight ? (hasVolume ? localChargeable : weight) : 0;

  const steps = [];
  let freightStep = null;
  let amount = 0;
  let mode = hasConfiguredPricing ? "configured" : "fallback";

  if (!hasWeight && !hasVolume) {
    return {
      show: false,
      mode,
      steps: [],
      freightStep: null,
      amount: 0,
      volumetricWeight: 0,
      chargeableWeight: 0,
      volumeCm3: null,
      actualWeightKg: weight,
      volumetricDivisor: divisor,
      hasConfiguredPricing,
    };
  }

  if (hasVolume && volumeCm3 != null) {
    steps.push({
      key: "volume",
      title: "Thể tích lô hàng",
      formula: formatCm3(volumeCm3),
      note: "Tổng thể tích (cm³) khai báo trên yêu cầu ký gửi.",
    });
  }

  if (hasVolume) {
    steps.push({
      key: "dim",
      title: "Cân quy đổi thể tích (DIM)",
      formula: `(${formatCm3(volumeCm3)}) ÷ ${divisor.toLocaleString("vi-VN")} = ${formatKg(volumetricWeight)}`,
      note: `Hệ số quy đổi thể tích = ${divisor.toLocaleString("vi-VN")} (PricingRule VOLUMETRIC_DIVISOR hoặc mặc định IATA).`,
    });
    steps.push({
      key: "chargeable",
      title: "Cân tính phí",
      formula: `MAX(${formatKg(weight)}, ${formatKg(volumetricWeight)}) = ${formatKg(chargeableWeight)}`,
      note: `${formatKg(weight)} = cân thực · ${formatKg(volumetricWeight)} = DIM — lấy số lớn hơn để tính cước theo kg.`,
    });
  } else if (hasWeight) {
    steps.push({
      key: "chargeable",
      title: "Cân tính phí",
      formula: `${formatKg(chargeableWeight)} (theo cân thực — chưa có thể tích để quy đổi DIM)`,
    });
  }

  if (!servicePricing) {
    return {
      show: steps.length > 0,
      mode: "fallback",
      steps,
      freightStep: null,
      amount: 0,
      volumetricWeight,
      chargeableWeight,
      volumeCm3,
      actualWeightKg: weight,
      volumetricDivisor: divisor,
      hasConfiguredPricing: false,
    };
  }

  const price = Number(servicePricing.price) || 0;

  switch (unitType) {
    case "KG": {
      if (price > 0) {
        amount = roundMoney(chargeableWeight * price);
        freightStep = {
          key: "freight",
          title: "Cước dịch vụ chính",
          formula: `${formatKg(chargeableWeight)} × ${formatMoney(price)}/kg = ${formatMoney(amount)}`,
          note: hasConfiguredPricing
            ? `Đơn giá từ bảng giá ${formatServicePricingRoute(servicePricing)}.`
            : null,
        };
      }
      break;
    }
    case "CBM": {
      if (price > 0 && hasVolume) {
        amount = roundMoney(volumeCm3Value * price);
        freightStep = {
          key: "freight",
          title: "Cước dịch vụ chính",
          formula: `${formatCm3(volumeCm3Value)} × ${formatMoney(price)}/cm³ = ${formatMoney(amount)}`,
          note: hasConfiguredPricing
            ? `Đơn giá từ bảng giá ${formatServicePricingRoute(servicePricing)} — tính theo cm³.`
            : null,
        };
      }
      break;
    }
    case "KG_OR_CBM": {
      const pricePerKg = Number(servicePricing.pricePerKg ?? price) || 0;
      const pricePerCbm = Number(servicePricing.pricePerCbm ?? price) || 0;
      const byKg = pricePerKg > 0 ? roundMoney(chargeableWeight * pricePerKg) : null;
      const byCbm =
        pricePerCbm > 0 && hasVolume ? roundMoney(volumeCm3Value * pricePerCbm) : null;

      if (byKg != null || byCbm != null) {
        const candidates = [byKg, byCbm].filter((value) => value != null);
        amount = roundMoney(Math.max(...candidates));
        const useKg = byKg != null && (byCbm == null || byKg >= byCbm);

        freightStep = {
          key: "freight",
          title: "Cước dịch vụ chính",
          formula:
            useKg && byKg != null
              ? `${formatKg(chargeableWeight)} × ${formatMoney(pricePerKg)}/kg = ${formatMoney(byKg)}`
              : byCbm != null
                ? `${formatCm3(volumeCm3Value)} × ${formatMoney(pricePerCbm)}/cm³ = ${formatMoney(byCbm)}`
                : null,
          note:
            byKg != null && byCbm != null
              ? `So sánh: theo kg ${formatMoney(byKg)} · theo cm³ ${formatMoney(byCbm)} → lấy ${formatMoney(amount)}`
              : hasConfiguredPricing
                ? `Đơn giá từ bảng giá ${formatServicePricingRoute(servicePricing)}.`
                : null,
        };
      }
      break;
    }
    default:
      break;
  }

  if (!freightStep && estimate?.estimatedFreightCharge != null && Number(estimate.estimatedFreightCharge) > 0) {
    const apiAmount = roundMoney(estimate.estimatedFreightCharge);
    // Bỏ qua cước BE nếu phình bất thường so với ước lượng local (kg × đơn giá).
    const localGuess =
      unitType === "KG" && price > 0 && chargeableWeight > 0
        ? roundMoney(chargeableWeight * price)
        : 0;
    const apiLooksInflated = localGuess > 0 && apiAmount > localGuess * 50;

    if (!apiLooksInflated) {
      amount = apiAmount;
      freightStep = {
        key: "freight",
        title: "Cước dịch vụ chính",
        formula: `${formatMoney(amount)} (từ báo giá hệ thống)`,
        note: "BE đã tính sẵn — khớp với bảng giá dịch vụ chính.",
      };
    }
  } else if (!freightStep) {
    freightStep = {
      key: "freight",
      title: "Cước dịch vụ chính",
      formula: null,
      note: hasConfiguredPricing
        ? "Thiếu đơn giá hoặc thể tích — kiểm tra thông số trên yêu cầu ký gửi."
        : "Chưa có bảng giá cho tuyến này — liên hệ Admin cấu hình service-pricings.",
    };
  }

  const visibleSteps = [
    ...steps,
    ...(freightStep?.formula ? [freightStep] : []),
  ];

  return {
    show: visibleSteps.length > 0 || Boolean(freightStep?.note),
    mode,
    steps,
    freightStep,
    amount,
    volumetricWeight,
    chargeableWeight,
    volumeCm3,
    actualWeightKg: weight,
    volumetricDivisor: divisor,
    unitTypeLabel: UNIT_TYPE_LABELS[unitType] ?? servicePricing.unitType,
    hasConfiguredPricing,
  };
}

export function formatServicePricingRoute(item) {
  if (!item) return "—";
  return `${item.originCountry || "?"} → ${item.destinationCountry || "?"}`;
}

export function formatMoney(amount) {
  if (amount == null || amount === "") return "—";

  const numeric =
    typeof amount === "string"
      ? Number(amount.replace(/[^\d.,-]/g, "").replace(/,/g, ""))
      : Number(amount);

  if (Number.isNaN(numeric)) return "—";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function normalizeServicePricingPayload(payload) {
  return {
    carrierId: extractGuid(payload.carrierId) || payload.carrierId?.trim() || null,
    carrierName: payload.carrierName?.trim() || null,
    serviceType: payload.serviceType,
    originCountry: payload.originCountry?.trim().toUpperCase(),
    destinationCountry: payload.destinationCountry?.trim().toUpperCase(),
    warehouseId: payload.warehouseId?.trim() || null,
    unitType: payload.unitType,
    price: payload.price === "" || payload.price == null ? null : Number(payload.price),
    pricePerKg:
      payload.pricePerKg === "" || payload.pricePerKg == null
        ? null
        : Number(payload.pricePerKg),
    pricePerCbm:
      payload.pricePerCbm === "" || payload.pricePerCbm == null
        ? null
        : Number(payload.pricePerCbm),
    currency: payload.currency?.trim().toUpperCase() || DEFAULT_CURRENCY,
    effectiveDate: payload.effectiveDate || new Date().toISOString(),
    isActive: payload.isActive !== false,
  };
}

function validateServicePricingPayload(data, { requireCarrierGuid = false } = {}) {
  if (!data.carrierId) {
    throw new ApiError(400, { message: "Vui lòng chọn đơn vị vận chuyển." });
  }
  if (
    requireCarrierGuid &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      data.carrierId
    )
  ) {
    throw new ApiError(400, {
      message: "Đơn vị vận chuyển không hợp lệ (thiếu UUID). Chọn lại từ danh sách.",
    });
  }
  if (!data.serviceType) {
    throw new ApiError(400, { message: "Vui lòng chọn loại dịch vụ." });
  }
  if (!data.originCountry || !data.destinationCountry) {
    throw new ApiError(400, { message: "Vui lòng nhập quốc gia xuất phát và đích." });
  }
  if (!data.unitType) {
    throw new ApiError(400, { message: "Vui lòng chọn đơn vị tính phí." });
  }
  if (data.unitType === "KG_OR_CBM") {
    if (data.pricePerKg == null || Number.isNaN(data.pricePerKg)) {
      throw new ApiError(400, { message: "Vui lòng nhập giá theo kg." });
    }
    if (data.pricePerCbm == null || Number.isNaN(data.pricePerCbm)) {
      throw new ApiError(400, { message: "Vui lòng nhập giá theo cm³." });
    }
  } else if (data.price == null || Number.isNaN(data.price)) {
    throw new ApiError(400, { message: "Vui lòng nhập đơn giá dịch vụ chính." });
  }
}

async function listServicePricingsMock(params = {}) {
  await mockDelay();
  return filterServicePricings(getMockStore().servicePricings, params);
}

async function createServicePricingMock(payload) {
  await mockDelay();
  const data = normalizeServicePricingPayload(payload);
  validateServicePricingPayload(data);

  const item = { id: nextMockId("SP"), ...data };
  getMockStore().servicePricings.unshift(item);
  return { message: "Thêm giá dịch vụ chính thành công.", item: { ...item } };
}

async function updateServicePricingMock(id, payload) {
  await mockDelay();
  const item = getMockStore().servicePricings.find((entry) => entry.id === id);
  if (!item) throw new ApiError(404, { message: "Không tìm thấy giá dịch vụ chính." });

  const data = normalizeServicePricingPayload({ ...item, ...payload });
  validateServicePricingPayload(data);
  Object.assign(item, data);

  return { message: "Cập nhật giá dịch vụ chính thành công.", item: { ...item } };
}

async function deleteServicePricingMock(id) {
  await mockDelay();
  const store = getMockStore();
  const index = store.servicePricings.findIndex((entry) => entry.id === id);
  if (index < 0) throw new ApiError(404, { message: "Không tìm thấy giá dịch vụ chính." });
  store.servicePricings.splice(index, 1);
  return { message: "Đã xóa giá dịch vụ chính." };
}

export async function listServicePricings(params = {}) {
  if (isMockMode()) return listServicePricingsMock(params);

  try {
    const raw = await apiRequest(`/api/service-pricings${buildQuery(params)}`);
    const items = Array.isArray(raw) ? raw : raw?.data ?? raw?.items ?? [];
    return items.map(normalizeServicePricingFromApi);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return [];
    }
    throw err;
  }
}

export async function createServicePricing(payload) {
  if (isMockMode()) return createServicePricingMock(payload);

  const data = normalizeServicePricingPayload(payload);
  validateServicePricingPayload(data, { requireCarrierGuid: true });

  const raw = await apiRequest("/api/service-pricings", {
    method: "POST",
    body: JSON.stringify(toApiServicePricingPayload(data)),
  });
  const item = normalizeServicePricingFromApi(raw?.item ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm giá dịch vụ chính thành công.", item };
}

export async function updateServicePricing(id, payload) {
  if (isMockMode()) return updateServicePricingMock(id, payload);

  const data = normalizeServicePricingPayload(payload);
  validateServicePricingPayload(data, { requireCarrierGuid: true });

  const raw = await apiRequest(`/api/service-pricings/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiServicePricingPayload(data)),
  });
  const item = normalizeServicePricingFromApi(raw?.item ?? raw?.data ?? { ...data, id });
  return { message: raw?.message || "Cập nhật giá dịch vụ chính thành công.", item };
}

export async function deleteServicePricing(id) {
  if (isMockMode()) return deleteServicePricingMock(id);
  return apiRequest(`/api/service-pricings/${id}`, { method: "DELETE" });
}

export function findServicePricingForWarehouse(servicePricings, warehouseId, serviceType = "STANDARD") {
  const normalizedType = String(serviceType ?? "").toUpperCase();

  return (
    servicePricings.find(
      (entry) =>
        entry.warehouseId === warehouseId &&
        String(entry.serviceType ?? "").toUpperCase() === normalizedType &&
        entry.isActive !== false
    ) ??
    servicePricings.find(
      (entry) => entry.warehouseId === warehouseId && entry.isActive !== false
    ) ??
    null
  );
}

async function listInternationalWarehousesMock() {
  await mockDelay();
  return getMockStore().internationalWarehouses.map((entry) => ({ ...entry }));
}

export async function listInternationalWarehouses() {
  if (isMockMode()) return listInternationalWarehousesMock();

  const raw = await apiRequest("/api/warehouses/active");
  const items = normalizeWarehouseListResponse(raw).filter((entry) => entry.isActive !== false);
  const originWarehouses = items.filter(
    (entry) => String(entry.warehouseType ?? "").toLowerCase() === "origin"
  );

  return originWarehouses.length ? originWarehouses : items;
}

function servicePricingRouteKey(pricing) {
  return [
    String(pricing.originCountry ?? "").trim().toUpperCase(),
    String(pricing.destinationCountry ?? "").trim().toUpperCase(),
    String(pricing.serviceType ?? "").trim().toUpperCase(),
  ].join("|");
}

/** Các tuyến + loại dịch vụ khả dụng từ bảng giá (fallback khi chưa chọn được kho). */
export function listServicePricingRouteOptions(servicePricings = []) {
  const seen = new Set();

  return servicePricings
    .filter((entry) => isConfiguredServicePricing(entry))
    .map((pricing) => {
      const route = buildConsignmentRouteFromPricing(pricing);
      const key = servicePricingRouteKey(pricing);

      return {
        key,
        route,
        serviceType: String(pricing.serviceType ?? "STANDARD").toUpperCase(),
        originCountry: pricing.originCountry,
        destinationCountry: pricing.destinationCountry,
        pricing,
        label: `${pricing.originCountry ?? "—"} → ${pricing.destinationCountry ?? "—"} · ${formatServiceTypeLabel(pricing.serviceType)}`,
      };
    })
    .filter((entry) => {
      if (!entry.route || seen.has(entry.key)) return false;
      seen.add(entry.key);
      return true;
    });
}

export function formatInternationalWarehouseLabel(warehouse) {
  if (!warehouse) return "—";
  const code = warehouse.code ? ` (${warehouse.code})` : "";
  return `${warehouse.name}${code}`;
}

const COUNTRY_ALIASES = {
  VN: ["VN", "VIETNAM", "VIET NAM", "VIỆT NAM"],
  CN: ["CN", "CHINA", "TQ", "TRUNG QUOC", "TRUNG QUỐC", "CHN"],
  US: ["US", "USA", "MY", "MỸ", "UNITED STATES"],
  JP: ["JP", "JAPAN", "NHAT", "NHẬT", "JPN"],
  KR: ["KR", "KOREA", "HÀN", "HAN", "KOR"],
};

function normalizeCountryToken(value) {
  const upper = String(value ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!upper) return "";

  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (aliases.some((alias) => upper === alias || upper.includes(alias))) {
      return canonical;
    }
  }

  return upper.length <= 3 ? upper : upper.slice(0, 2);
}

function countriesMatch(left, right) {
  const a = normalizeCountryToken(left);
  const b = normalizeCountryToken(right);
  if (!a || !b) return false;
  return a === b;
}

export function parseConsignmentRoute(consignment) {
  const parts = String(consignment?.route ?? "")
    .split(/[-–—>/]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    origin: parts[0] ?? null,
    destination: parts[1] ?? null,
  };
}

/** Nhãn tuyến từ yêu cầu ký gửi (ưu tiên `route` BE, không dùng kho/bảng giá mặc định). */
export function formatConsignmentRouteLabel(consignment) {
  if (!consignment) return "—";
  const raw = String(consignment.route ?? "").trim();
  if (!raw) return "—";

  const { origin, destination } = parseConsignmentRoute(consignment);
  if (origin && destination) return `${origin} → ${destination}`;
  return raw;
}

/** Suy ra mã quốc gia khi BE không trả `warehouse.code` (vd. `CN-GZ` → `CN`). */
export function inferWarehouseCountryCode(warehouse) {
  if (!warehouse) return null;

  const code = warehouse.code?.trim();
  if (code) {
    const prefix = code.includes("-") ? code.split("-")[0] : code;
    const fromCode = normalizeCountryToken(prefix);
    if (fromCode) return fromCode;
  }

  const country = warehouse.country?.trim();
  if (country) {
    const fromCountry = normalizeCountryToken(country);
    if (fromCountry) return fromCountry;
  }

  const text = `${warehouse.name ?? ""} ${warehouse.address ?? ""}`
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // VN trước CN: tránh "Khu CN" (công nghiệp) bị nhận là Trung Quốc.
  if (/(VIET NAM|VIETNAM|\bVN\b|HCM|HA NOI|DA NANG|TAN BINH)/.test(text)) return "VN";
  if (/(^|\W)(US|USA|MY|CALIFORNIA|\bLA\b)/.test(text)) return "US";
  if (/(TRUNG QUOC|CHINA|\bTQ\b|GUANGZHOU|SHENZHEN|SHANGHAI)/.test(text)) return "CN";
  if (/(NHAT BAN|JAPAN|\bJP\b|TOKYO)/.test(text)) return "JP";
  if (/(HAN QUOC|KOREA|\bKR\b|SEOUL)/.test(text)) return "KR";

  return null;
}

/**
 * Mã quốc gia duy nhất từ kho đang hoạt động (lọc theo Origin/Destination nếu có).
 * @param {Array} warehouses
 * @param {{ warehouseType?: string; include?: string | null }} [options]
 */
export function listWarehouseCountryCodes(warehouses, { warehouseType, include } = {}) {
  const codes = new Set();

  for (const warehouse of warehouses || []) {
    if (warehouse?.isActive === false) continue;
    if (warehouseType) {
      const type = String(warehouse.warehouseType ?? "").toLowerCase();
      if (type !== String(warehouseType).toLowerCase()) continue;
    }
    const code = inferWarehouseCountryCode(warehouse);
    if (code) codes.add(code);
  }

  const extra = String(include ?? "").trim().toUpperCase();
  if (extra) codes.add(normalizeCountryToken(extra) || extra);

  return Array.from(codes).sort((a, b) => a.localeCompare(b));
}

export function buildConsignmentRouteFromPricing(pricing) {
  if (!pricing) return null;

  const origin = pricing.originCountry?.trim();
  const destination = pricing.destinationCountry?.trim();
  if (origin && destination) return `${origin}-${destination}`;
  return origin || null;
}

export function resolveConsignmentRouteForCreate({ pricing, warehouse, serviceType } = {}) {
  const fromPricing = buildConsignmentRouteFromPricing(pricing);
  if (fromPricing) return fromPricing;

  const origin = inferWarehouseCountryCode(warehouse);
  if (origin) return `${origin}-VN`;

  return serviceType ? String(serviceType).toUpperCase() : "US";
}

/**
 * Lọc bảng giá theo tuyến đơn / kho. API thật không có warehouseId — match origin/destination.
 */
export function filterServicePricingsForQuotation(
  servicePricings,
  { warehouse, consignment } = {}
) {
  const active = servicePricings.filter((entry) => entry.isActive !== false);
  if (!active.length) return [];

  const { origin, destination } = parseConsignmentRoute(consignment);
  const originHint = origin ?? inferWarehouseCountryCode(warehouse) ?? warehouse?.code ?? null;
  const destinationHint = destination ?? "VN";

  if (originHint || destinationHint) {
    const byRoute = active.filter(
      (entry) =>
        (!originHint || countriesMatch(entry.originCountry, originHint)) &&
        (!destinationHint || countriesMatch(entry.destinationCountry, destinationHint))
    );
    if (byRoute.length) return byRoute;
    // Đơn đã có báo giá từ BE — khớp theo loại dịch vụ để hiển thị (không đổi tuyến hiển thị).
    if (String(consignment?.route ?? "").trim()) {
      if (consignment?.quotation) {
        const serviceType = String(
          consignment.consignmentType ?? consignment.shippingOption ?? "STANDARD"
        ).toUpperCase();
        const byType = active.filter(
          (entry) => String(entry.serviceType ?? "").toUpperCase() === serviceType
        );
        if (byType.length) return byType;
      }
      return [];
    }
  }

  if (warehouse?.id) {
    const byWarehouse = active.filter((entry) => entry.warehouseId === warehouse.id);
    if (byWarehouse.length) return byWarehouse;
  }

  return active;
}

export function getAvailableServiceTypes(servicePricings, context = {}) {
  const matched = filterServicePricingsForQuotation(servicePricings, context);
  const source = matched.length
    ? matched
    : servicePricings.filter((entry) => entry.isActive !== false);

  return [...new Set(source.map((entry) => entry.serviceType).filter(Boolean))];
}

export function formatServiceTypeLabel(serviceType) {
  const key = String(serviceType ?? "").toUpperCase();
  return SERVICE_TYPE_LABELS[key] ?? serviceType ?? "—";
}

export function findServicePricingForQuotation(
  servicePricings,
  { warehouse, consignment, serviceType = "STANDARD" } = {}
) {
  const candidates = filterServicePricingsForQuotation(servicePricings, {
    warehouse,
    consignment,
  });
  const normalizedType = String(serviceType ?? "").toUpperCase();

  const byType = candidates.find(
    (entry) => String(entry.serviceType ?? "").toUpperCase() === normalizedType
  );
  if (byType) return byType;

  if (warehouse?.id) {
    const byWarehouse = findServicePricingForWarehouse(
      servicePricings,
      warehouse.id,
      serviceType
    );
    if (byWarehouse) return byWarehouse;
  }

  return candidates[0] ?? null;
}
