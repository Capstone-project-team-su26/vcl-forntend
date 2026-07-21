import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import { normalizeWarehouseListResponse } from "@/modules/warehouses/mappers";
import { normalizeServicePricingFromApi, toApiServicePricingPayload } from "./mappers";

function buildQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") {
    params.set("isActive", String(isActive));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listServicePricingsApi(params = {}) {
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

export async function createServicePricingApi(data) {
  const raw = await apiRequest("/api/service-pricings", {
    method: "POST",
    body: JSON.stringify(toApiServicePricingPayload(data)),
  });
  const item = normalizeServicePricingFromApi(raw?.item ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm giá dịch vụ chính thành công.", item };
}

export async function updateServicePricingApi(id, data) {
  const raw = await apiRequest(`/api/service-pricings/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiServicePricingPayload(data)),
  });
  const item = normalizeServicePricingFromApi(raw?.item ?? raw?.data ?? { ...data, id });
  return { message: raw?.message || "Cập nhật giá dịch vụ chính thành công.", item };
}

export async function deleteServicePricingApi(id) {
  return apiRequest(`/api/service-pricings/${id}`, { method: "DELETE" });
}

export async function listInternationalWarehousesApi() {
  const raw = await apiRequest("/api/warehouses/active");
  const items = normalizeWarehouseListResponse(raw).filter((entry) => entry.isActive !== false);
  const originWarehouses = items.filter(
    (entry) => String(entry.warehouseType ?? "").toLowerCase() === "origin"
  );

  return originWarehouses.length ? originWarehouses : items;
}
