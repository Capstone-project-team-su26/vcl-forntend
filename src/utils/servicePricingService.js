import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeServicePricingFromApi,
  normalizeWarehouseListResponse,
  toApiServicePricingPayload,
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
  CBM: "Theo m³ (CBM)",
  KG_OR_CBM: "Kg hoặc CBM (lấy cao hơn)",
};

/** Hệ số DIM air express — khớp vcl-BE (`VolumetricDivisor = 5000` trên cm³). */
export const VOLUMETRIC_DIVISOR_CM3 = 5000;
/** Quy đổi m³ → kg DIM: 1 m³ = 1.000.000 cm³ → ÷ 5000 = × 200 */
export const VOLUMETRIC_FACTOR_M3 = 1_000_000 / VOLUMETRIC_DIVISOR_CM3;

function normalizeUnitType(raw) {
  const upper = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (!upper) return null;
  if (upper === "KG" || upper === "KILOGRAM") return "KG";
  if (upper === "CBM" || upper === "M3" || upper === "M³") return "CBM";
  if (upper.includes("KG") && upper.includes("CBM")) return "KG_OR_CBM";
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
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

function formatM3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 4 })} m³`;
}

function formatCm3(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} cm³`;
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

/** Cân DIM theo kích thước từng kiện (cm) — khớp BE: L×W×H÷5000. */
export function calculateItemDimWeightKg(length, width, height) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (!l || !w || !h) return null;
  return Math.round(((l * w * h) / VOLUMETRIC_DIVISOR_CM3) * 100) / 100;
}

export function formatItemDimensions(length, width, height) {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  if (!l || !w || !h) return null;
  return `${l} × ${w} × ${h} cm`;
}

export function formatItemDimFormula(length, width, height) {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  const dimKg = calculateItemDimWeightKg(l, w, h);
  if (dimKg == null) return null;
  const dimLabel = dimKg.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `(${l} × ${w} × ${h}) / ${VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")} = ${dimLabel} kg`;
}

export function calculateVolumetricWeight(volumeM3) {
  const volume = Number(volumeM3) || 0;
  return roundMoney(volume * VOLUMETRIC_FACTOR_M3);
}

export function calculateChargeableWeight(weightKg, volumeM3) {
  const weight = Number(weightKg) || 0;
  const volumetric = calculateVolumetricWeight(volumeM3);
  return roundMoney(Math.max(weight, volumetric));
}

export function calculateMainServiceAmount(
  servicePricing,
  { weightKg = 0, volumeM3 = 0 } = {}
) {
  if (!servicePricing) return 0;

  const volume = Number(volumeM3) || 0;
  const chargeable = calculateChargeableWeight(weightKg, volumeM3);
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
 * - Có bảng giá BE: hiển thị đơn giá thật, không nhắc hệ số 5.000 mặc định.
 * - Chưa có bảng giá: ước tính DIM với ÷ 5.000 (chỉ khi có thể tích > 0).
 */
export function buildMainServicePricingBreakdown(
  servicePricing,
  { weightKg = 0, volumeM3 = 0, estimate = null } = {}
) {
  const weight = Number(weightKg) || 0;
  const volume = Number(volumeM3) || 0;
  const hasWeight = weight > 0;
  const hasVolume = volume > 0;
  const hasConfiguredPricing = isConfiguredServicePricing(servicePricing);
  const unitType = normalizeUnitType(servicePricing?.unitType);

  const volumeCm3 = hasVolume ? volumeM3ToCm3(volume) : null;
  const localVolumetric = hasVolume ? calculateVolumetricWeight(volume) : 0;
  const volumetricWeight =
    estimate?.volumetricWeight != null ? Number(estimate.volumetricWeight) : localVolumetric;
  const chargeableWeight =
    estimate?.chargeableWeight != null
      ? Number(estimate.chargeableWeight)
      : hasVolume
        ? calculateChargeableWeight(weightKg, volumeM3)
        : weight;

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

  if (hasVolume && volumetricWeight > 0) {
    steps.push({
      key: "dim",
      title: "Cân quy đổi thể tích (DIM)",
      formula: `(${formatCm3(volumeCm3)}) ÷ ${VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")} = ${formatKg(volumetricWeight)}`,
      note: "DIM không phải cân thực — quy đổi tổng thể tích (cm³) thành cân nặng quy định.",
    });
  }

  if (hasVolume && volumetricWeight > 0) {
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
        amount = roundMoney(volume * price);
        freightStep = {
          key: "freight",
          title: "Cước dịch vụ chính",
          formula: `${formatM3(volume)} × ${formatMoney(price)}/m³ = ${formatMoney(amount)}`,
          note: hasConfiguredPricing
            ? `Đơn giá từ bảng giá ${formatServicePricingRoute(servicePricing)} — tính theo CBM.`
            : null,
        };
      }
      break;
    }
    case "KG_OR_CBM": {
      const pricePerKg = Number(servicePricing.pricePerKg ?? price) || 0;
      const pricePerCbm = Number(servicePricing.pricePerCbm ?? price) || 0;
      const byKg = pricePerKg > 0 ? roundMoney(chargeableWeight * pricePerKg) : null;
      const byCbm = pricePerCbm > 0 && hasVolume ? roundMoney(volume * pricePerCbm) : null;

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
                ? `${formatM3(volume)} × ${formatMoney(pricePerCbm)}/m³ = ${formatMoney(byCbm)}`
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
    amount = roundMoney(estimate.estimatedFreightCharge);
    freightStep = {
      key: "freight",
      title: "Cước dịch vụ chính",
      formula: `${formatMoney(amount)} (từ báo giá hệ thống)`,
      note: "BE đã tính sẵn — khớp với bảng giá dịch vụ chính.",
    };
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
    carrierId: payload.carrierId?.trim() || "VCL",
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

function validateServicePricingPayload(data) {
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
      throw new ApiError(400, { message: "Vui lòng nhập giá theo CBM." });
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
  validateServicePricingPayload(data);

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
  validateServicePricingPayload(data);

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

  const raw = await apiRequest("/api/warehouses");
  const items = normalizeWarehouseListResponse(raw).filter((entry) => entry.isActive !== false);
  const originWarehouses = items.filter(
    (entry) => String(entry.warehouseType ?? "").toLowerCase() === "origin"
  );

  return originWarehouses.length ? originWarehouses : items;
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

function parseConsignmentRoute(consignment) {
  const parts = String(consignment?.route ?? "")
    .split(/[-–—>/]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    origin: parts[0] ?? null,
    destination: parts[1] ?? null,
  };
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
  const originHint = origin ?? warehouse?.code ?? null;
  const destinationHint = destination ?? "VN";

  if (originHint || destinationHint) {
    const byRoute = active.filter(
      (entry) =>
        (!originHint || countriesMatch(entry.originCountry, originHint)) &&
        (!destinationHint || countriesMatch(entry.destinationCountry, destinationHint))
    );
    if (byRoute.length) return byRoute;
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
