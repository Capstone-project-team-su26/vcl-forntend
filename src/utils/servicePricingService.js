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
};

export const UNIT_TYPE_LABELS = {
  KG: "Theo kg",
  CBM: "Theo m³ (CBM)",
  KG_OR_CBM: "Kg hoặc CBM (lấy cao hơn)",
};

const VOLUMETRIC_DIVISOR = 167;

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

export function calculateVolumetricWeight(volumeM3) {
  return roundMoney((Number(volumeM3) || 0) * VOLUMETRIC_DIVISOR);
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

  const weight = Number(weightKg) || 0;
  const volume = Number(volumeM3) || 0;
  const price = Number(servicePricing.price) || 0;

  switch (servicePricing.unitType) {
    case "KG":
      return roundMoney(weight * price);
    case "CBM":
      return roundMoney(volume * price);
    case "KG_OR_CBM": {
      const byKg = weight * (Number(servicePricing.pricePerKg ?? price) || 0);
      const byCbm = volume * (Number(servicePricing.pricePerCbm ?? price) || 0);
      return roundMoney(Math.max(byKg, byCbm));
    }
    default:
      return 0;
  }
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
  return (
    servicePricings.find(
      (entry) =>
        entry.warehouseId === warehouseId &&
        entry.serviceType === serviceType &&
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
