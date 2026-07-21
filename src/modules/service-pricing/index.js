import { isMockMode } from "@/utils/mocks/dataSource";
import { ApiError } from "@/utils/apiError";
import { extractGuid } from "@/utils/apiMappers";
import {
  listServicePricingsApi,
  createServicePricingApi,
  updateServicePricingApi,
  deleteServicePricingApi,
  listInternationalWarehousesApi,
} from "./api";
import {
  listServicePricingsMock,
  createServicePricingMock,
  updateServicePricingMock,
  deleteServicePricingMock,
  listInternationalWarehousesMock,
  getMockServicePricing,
} from "./mock";

export {
  normalizeServicePricingFromApi,
  toApiServicePricingPayload,
} from "./mappers";

export const DEFAULT_CURRENCY = "VND";

export const SERVICE_TYPE_LABELS = {
  EXPRESS: "Express",
  STANDARD: "Standard",
  ECONOMY: "Economy",
  FREIGHT: "Freight",
  CONSOLIDATION: "Consolidation",
};

export const UNIT_TYPE_LABELS = {
  KG: "Theo cân tính phí (kg)",
  CBM: "Theo thể tích (m³ / CBM)",
  KG_OR_CBM: "Theo kg hoặc m³ — lấy mức cao hơn",
};

/**
 * Hệ số DIM mặc định (IATA) — khớp BE khi chưa có PricingRule `VOLUMETRIC_DIVISOR`.
 * Công thức: VolumetricWeight = TotalVolume(cm³) / divisor.
 */
export const VOLUMETRIC_DIVISOR_CM3 = 5000;
export const VOLUMETRIC_DIVISOR_RULE = "VOLUMETRIC_DIVISOR";

/** VAT mặc định khi chưa có PricingRule — khớp BE cũ / fallback. */
export const DEFAULT_QUOTATION_VAT_RATE = 0.08;
export const VAT_RULE = "VAT";
export const IMPORT_TAX_RULE = "IMPORT_TAX";

/** @deprecated dùng VOLUMETRIC_DIVISOR_CM3; giữ để tương thích chỗ còn nhắc m³. */
export const VOLUMETRIC_FACTOR_M3 = 1_000_000 / VOLUMETRIC_DIVISOR_CM3;

/** Quy tắc cấu hình (không phải phụ phí bật/tắt trên báo giá). DOMESTIC_FEE vẫn là phụ phí. */
const PRICING_CONFIG_RULES = new Set([
  VOLUMETRIC_DIVISOR_RULE,
  "MIN_WEIGHT",
  VAT_RULE,
  "VAT_RATE",
  IMPORT_TAX_RULE,
  "IMPORT_TAX_RATE",
]);

function ruleKey(fee) {
  return String(fee?.ruleType ?? fee?.code ?? fee?.ruleCode ?? "")
    .trim()
    .toUpperCase();
}

function ruleMatches(fee, names) {
  const key = ruleKey(fee);
  const code = String(fee?.ruleCode ?? fee?.code ?? "").toUpperCase();
  return names.some((name) => key === name || code === name || code.includes(name));
}

export function isPricingConfigRule(fee) {
  const key = ruleKey(fee);
  if (PRICING_CONFIG_RULES.has(key)) return true;
  const code = String(fee?.ruleCode ?? fee?.code ?? "").toUpperCase();
  return (
    PRICING_CONFIG_RULES.has(code) ||
    code.includes(VOLUMETRIC_DIVISOR_RULE) ||
    code.includes(VAT_RULE) ||
    code.includes(IMPORT_TAX_RULE)
  );
}

export function isVolumetricDivisorRule(fee) {
  return ruleMatches(fee, [VOLUMETRIC_DIVISOR_RULE]);
}

export function isVatRule(fee) {
  return ruleMatches(fee, [VAT_RULE, "VAT_RATE"]);
}

export function isImportTaxRule(fee) {
  return ruleMatches(fee, [IMPORT_TAX_RULE, "IMPORT_TAX_RATE"]);
}

/** Đọc % VAT từ PricingRule (value 8 → 0.08). Fallback DEFAULT_QUOTATION_VAT_RATE. */
export function resolveVatRate(rules = []) {
  const rule = (Array.isArray(rules) ? rules : []).find(isVatRule);
  if (!rule) return DEFAULT_QUOTATION_VAT_RATE;

  const raw =
    rule.percentageRate ??
    rule.value ??
    rule.fixedAmount ??
    rule.conditionValue;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return DEFAULT_QUOTATION_VAT_RATE;
  // Admin thường nhập 8 (phần trăm); chấp nhận cả 0.08.
  return value > 1 ? value / 100 : value;
}

export function formatVatRatePercent(rate = DEFAULT_QUOTATION_VAT_RATE) {
  const pct = (Number(rate) || 0) * 100;
  return `${pct.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
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

function formatKg(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;
}

function formatM3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 4 })} m³`;
}

/** Luôn cm³ — dùng trong công thức DIM (volume ÷ divisor). */
function formatCm3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} cm³`;
}

/**
 * Hiển thị thể tích gọn trên list/card: ≥ 1000 cm³ → m³.
 * Không dùng trong công thức tính phí.
 */
export function formatVolumeCm3(value) {
  const numeric = Number(value) || 0;
  if (numeric >= 1000) {
    const m3 = numeric / 1_000_000;
    return `${m3.toLocaleString("vi-VN", {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    })} m³`;
  }
  return formatCm3(numeric);
}

export function volumeM3ToCm3(volumeM3) {
  return roundMoney((Number(volumeM3) || 0) * 1_000_000);
}

export function volumeCm3ToM3(volumeCm3) {
  return (Number(volumeCm3) || 0) / 1_000_000;
}

/**
 * BE trả `totalVolume` (cm³) và `totalVolumeM3` (m³). Tin thẳng số API, không tự suy đoán/quy đổi.
 * Ưu tiên `totalVolume` (cm³); nếu thiếu thì suy từ `totalVolumeM3`.
 */
export function normalizeVolumeCm3FromApi(raw, { totalVolumeM3 } = {}) {
  if (raw != null && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  if (totalVolumeM3 != null && totalVolumeM3 !== "") {
    const m3 = Number(totalVolumeM3);
    if (Number.isFinite(m3) && m3 >= 0) return volumeM3ToCm3(m3);
  }
  return null;
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

/**
 * DIM cả đơn từ kích thước kiện: Σ (D×R×C / divisor).
 * Mỗi dòng items = 1 kiện (quantity = số món trong kiện, không nhân thêm).
 */
export function resolveConsignmentDimFromItems(items, divisor = VOLUMETRIC_DIVISOR_CM3) {
  if (!Array.isArray(items) || !items.length) return null;

  const dim = normalizeDivisor(divisor);
  const parts = [];
  let totalKg = 0;

  for (const item of items) {
    const kg = calculateItemDimWeightKg(item?.length, item?.width, item?.height, dim);
    if (kg == null) continue;
    parts.push({
      length: Number(item.length),
      width: Number(item.width),
      height: Number(item.height),
      dimKg: kg,
    });
    totalKg += kg;
  }

  if (!parts.length) return null;
  return { volumetricWeight: totalKg, parts, divisor: dim };
}

export function formatItemDimensions(length, width, height) {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  if (!l || !w || !h) return null;
  return `${l} × ${w} × ${h} cm`;
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

/** Tổng thể tích đơn (cm³) — không nhân quantity; dùng thẳng cặp totalVolume + totalVolumeM3 từ BE. */
export function resolveConsignmentTotalVolumeCm3({ totalVolume, totalVolumeM3 } = {}) {
  return normalizeVolumeCm3FromApi(totalVolume, { totalVolumeM3 });
}

/** DIM (kg) = (Dài × Rộng × Cao cm) / hệ số — tương đương thể tích cm³ ÷ hệ số. */
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

  const volumeCm3Value = resolveVolumeCm3({ volumeCm3, volumeM3 });
  const volumeM3Value = volumeCm3ToM3(volumeCm3Value);
  const chargeable = calculateChargeableWeight(weightKg, volumeCm3Value, volumetricDivisor);
  const price = Number(servicePricing.price) || 0;
  const unitType = normalizeUnitType(servicePricing.unitType);

  switch (unitType) {
    case "KG":
      return roundMoney(chargeable * price);
    case "CBM":
      // price = VND/m³ (CBM logistics), không phải VND/cm³.
      return roundMoney(volumeM3Value * price);
    case "KG_OR_CBM": {
      const byKg = chargeable * (Number(servicePricing.pricePerKg ?? price) || 0);
      const byCbm = volumeM3Value * (Number(servicePricing.pricePerCbm ?? price) || 0);
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
    items = null,
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
  const volumeM3Value = hasVolume ? volumeCm3ToM3(volumeCm3Value) : 0;
  const fromItems = resolveConsignmentDimFromItems(items, divisor);
  const localVolumetric = fromItems
    ? fromItems.volumetricWeight
    : hasVolume
      ? calculateVolumetricWeight(volumeCm3Value, divisor)
      : 0;

  // ponytail: DIM = (D×R×C)/divisor — ưu tiên kích thước kiện; không tin estimate BE cũ.
  const volumetricWeight = localVolumetric > 0 ? localVolumetric : 0;
  const chargeableWeight =
    volumetricWeight > 0 || hasWeight ? Math.max(weight, volumetricWeight) : 0;

  const steps = [];
  let freightStep = null;
  let amount = 0;
  let mode = hasConfiguredPricing ? "configured" : "fallback";

  if (!hasWeight && !hasVolume && volumetricWeight <= 0) {
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

  if (fromItems?.parts?.length) {
    const first = fromItems.parts[0];
    const volumeFormula =
      fromItems.parts.length === 1
        ? `${first.length} × ${first.width} × ${first.height} cm`
        : fromItems.parts
            .map((part) => `${part.length}×${part.width}×${part.height}`)
            .join(" + ") + " cm";
    steps.push({
      key: "volume",
      title: "Kích thước kiện (D × R × C)",
      formula: volumeFormula,
      note:
        fromItems.parts.length === 1
          ? "Kích thước từng kiện hàng (cm) khai báo trên yêu cầu ký gửi."
          : `Tổng ${fromItems.parts.length} kiện — DIM cộng dồn từng kiện.`,
    });
    steps.push({
      key: "dim",
      title: "Cân quy đổi thể tích (DIM)",
      formula:
        fromItems.parts.length === 1
          ? `(${first.length} × ${first.width} × ${first.height}) / ${divisor.toLocaleString("vi-VN")} = ${formatKg(volumetricWeight)}`
          : `Σ (D × R × C) / ${divisor.toLocaleString("vi-VN")} = ${formatKg(volumetricWeight)}`,
      note: `Công thức DIM: (Dài × Rộng × Cao cm) ÷ ${divisor.toLocaleString("vi-VN")} (PricingRule VOLUMETRIC_DIVISOR hoặc mặc định IATA).`,
    });
  } else if (hasVolume && volumeCm3 != null) {
    steps.push({
      key: "volume",
      title: "Thể tích lô hàng (= D × R × C)",
      formula: formatCm3(volumeCm3),
      note: "Thể tích khai báo = Dài × Rộng × Cao (cm³) trên yêu cầu ký gửi.",
    });
    steps.push({
      key: "dim",
      title: "Cân quy đổi thể tích (DIM)",
      formula: `(Dài × Rộng × Cao) / ${divisor.toLocaleString("vi-VN")} = ${formatKg(volumetricWeight)}`,
      note: `= ${formatCm3(volumeCm3)} ÷ ${divisor.toLocaleString("vi-VN")}. Hệ số ${divisor.toLocaleString("vi-VN")} (PricingRule VOLUMETRIC_DIVISOR hoặc mặc định IATA).`,
    });
  }

  if (volumetricWeight > 0 || hasWeight) {
    steps.push({
      key: "chargeable",
      title: "Cân tính phí",
      formula:
        volumetricWeight > 0
          ? `MAX(${formatKg(weight)}, ${formatKg(volumetricWeight)}) = ${formatKg(chargeableWeight)}`
          : `${formatKg(chargeableWeight)} (theo cân thực tế — chưa có kích thước để quy đổi DIM)`,
      note:
        volumetricWeight > 0
          ? `${formatKg(weight)} = cân thực tế · ${formatKg(volumetricWeight)} = cân DIM — lấy số lớn hơn để tính cước.`
          : null,
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
          title: "Cước chính",
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
        amount = roundMoney(volumeM3Value * price);
        freightStep = {
          key: "freight",
          title: "Cước chính",
          formula: `${formatM3(volumeM3Value)} × ${formatMoney(price)}/m³ = ${formatMoney(amount)}`,
          note: hasConfiguredPricing
            ? `Đơn giá từ bảng giá ${formatServicePricingRoute(servicePricing)} — tính theo m³ (CBM).`
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
        pricePerCbm > 0 && hasVolume ? roundMoney(volumeM3Value * pricePerCbm) : null;

      if (byKg != null || byCbm != null) {
        const candidates = [byKg, byCbm].filter((value) => value != null);
        amount = roundMoney(Math.max(...candidates));
        const useKg = byKg != null && (byCbm == null || byKg >= byCbm);

        freightStep = {
          key: "freight",
          title: "Cước chính",
          formula:
            useKg && byKg != null
              ? `${formatKg(chargeableWeight)} × ${formatMoney(pricePerKg)}/kg = ${formatMoney(byKg)}`
              : byCbm != null
                ? `${formatM3(volumeM3Value)} × ${formatMoney(pricePerCbm)}/m³ = ${formatMoney(byCbm)}`
                : null,
          note:
            byKg != null && byCbm != null
              ? `So sánh: theo kg ${formatMoney(byKg)} · theo m³ ${formatMoney(byCbm)} → lấy ${formatMoney(amount)}`
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
    // Chỉ dùng cước BE khi chưa tính được local (thiếu đơn giá / unitType).
    amount = apiAmount;
    freightStep = {
      key: "freight",
      title: "Cước chính",
      formula: `${formatMoney(amount)} (từ báo giá hệ thống)`,
      note: "BE đã tính sẵn — khớp với bảng giá dịch vụ chính.",
    };
  } else if (!freightStep) {
    freightStep = {
      key: "freight",
      title: "Cước chính",
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
      throw new ApiError(400, { message: "Vui lòng nhập giá theo m³ (CBM)." });
    }
  } else if (data.price == null || Number.isNaN(data.price)) {
    throw new ApiError(400, { message: "Vui lòng nhập đơn giá dịch vụ chính." });
  }
}

export async function listServicePricings(params = {}) {
  if (isMockMode()) return listServicePricingsMock(params);
  return listServicePricingsApi(params);
}

export async function createServicePricing(payload) {
  const data = normalizeServicePricingPayload(payload);
  if (isMockMode()) {
    validateServicePricingPayload(data);
    return createServicePricingMock(data);
  }
  validateServicePricingPayload(data, { requireCarrierGuid: true });
  return createServicePricingApi(data);
}

export async function updateServicePricing(id, payload) {
  if (isMockMode()) {
    const existing = getMockServicePricing(id);
    if (!existing) throw new ApiError(404, { message: "Không tìm thấy giá dịch vụ chính." });
    const data = normalizeServicePricingPayload({ ...existing, ...payload });
    validateServicePricingPayload(data);
    return updateServicePricingMock(id, data);
  }

  const data = normalizeServicePricingPayload(payload);
  validateServicePricingPayload(data, { requireCarrierGuid: true });
  return updateServicePricingApi(id, data);
}

export async function deleteServicePricing(id) {
  if (isMockMode()) return deleteServicePricingMock(id);
  return deleteServicePricingApi(id);
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

export async function listInternationalWarehouses() {
  if (isMockMode()) return listInternationalWarehousesMock();
  return listInternationalWarehousesApi();
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

/** Nhãn tuyến từ yêu cầu ký gửi (ưu tiên `route` BE; fallback điểm đến / bảng giá). */
export function formatConsignmentRouteLabel(consignment, servicePricing = null) {
  if (!consignment) return "—";
  const raw = String(consignment.route ?? "").trim();
  if (raw) {
    const { origin, destination } = parseConsignmentRoute(consignment);
    if (origin && destination) return `${origin} → ${destination}`;
    return raw;
  }

  if (servicePricing) {
    const pricingRoute = formatServicePricingRoute(servicePricing);
    if (pricingRoute && pricingRoute !== "—") return pricingRoute;
  }

  const fallback = String(
    consignment.destination ?? consignment.warehouseName ?? ""
  ).trim();
  return fallback || "—";
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
  const hasRoute = Boolean(String(context?.consignment?.route ?? "").trim());
  const source = matched.length
    ? matched
    : hasRoute
      ? []
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

  // Đã có route cụ thể nhưng không có bảng giá cùng tuyến/dịch vụ: không bắt nhầm route khác.
  if (String(consignment?.route ?? "").trim()) return candidates[0] ?? null;

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
