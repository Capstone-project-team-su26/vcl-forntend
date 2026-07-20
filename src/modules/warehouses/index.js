import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listWarehousesApi,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  listWarehouseLocationsApi,
  createWarehouseLocationApi,
  updateWarehouseLocationApi,
  deleteWarehouseLocationApi,
} from "./api";
import {
  listWarehousesMock,
  createWarehouseMock,
  updateWarehouseMock,
  deleteWarehouseMock,
  listWarehouseLocationsMock,
  createWarehouseLocationMock,
  updateWarehouseLocationMock,
  deleteWarehouseLocationMock,
} from "./mock";

export {
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  toApiWarehousePayload,
  normalizeWarehouseLocationFromApi,
  normalizeWarehouseLocationListResponse,
  toApiWarehouseLocationPayload,
} from "./mappers";

/** Giá trị khớp API (`Origin` / `Destination`), không có endpoint danh mục riêng. */
export const WAREHOUSE_TYPE_LABELS = {
  Origin: "Kho xuất phát",
  Destination: "Kho đích",
};

export const LOCATION_TYPE_LABELS = {
  ZONE: "Zone",
  SHELF: "Shelf",
  BIN: "Bin",
};

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listWarehouses(params = {}) {
  if (isMockMode()) return listWarehousesMock(params);
  return listWarehousesApi(params);
}

export async function createWarehouse(payload) {
  if (isMockMode()) return createWarehouseMock(payload);
  return createWarehouseApi(payload);
}

export async function updateWarehouse(id, payload) {
  if (isMockMode()) return updateWarehouseMock(id, payload);
  return updateWarehouseApi(id, payload);
}

export async function deleteWarehouse(id) {
  if (isMockMode()) return deleteWarehouseMock(id);
  return deleteWarehouseApi(id);
}

export async function listWarehouseLocations(warehouseId) {
  if (isMockMode()) return listWarehouseLocationsMock(warehouseId);
  return listWarehouseLocationsApi(warehouseId);
}

export async function createWarehouseLocation(warehouseId, payload) {
  if (isMockMode()) return createWarehouseLocationMock(warehouseId, payload);
  return createWarehouseLocationApi(warehouseId, payload);
}

export async function updateWarehouseLocation(locationId, payload) {
  if (isMockMode()) return updateWarehouseLocationMock(locationId, payload);
  return updateWarehouseLocationApi(locationId, payload);
}

export async function deleteWarehouseLocation(locationId) {
  if (isMockMode()) return deleteWarehouseLocationMock(locationId);
  return deleteWarehouseLocationApi(locationId);
}

export function formatWarehouseType(type) {
  if (!type) return "—";
  if (WAREHOUSE_TYPE_LABELS[type]) return WAREHOUSE_TYPE_LABELS[type];
  const match = Object.entries(WAREHOUSE_TYPE_LABELS).find(
    ([value]) => value.toLowerCase() === String(type).toLowerCase()
  );
  return match?.[1] || type;
}

export function formatLocationType(type) {
  return LOCATION_TYPE_LABELS[type] || type || "—";
}

export function getParentLocationLabel(locations, parentId) {
  if (!parentId) return "—";
  const parent = locations.find((item) => item.id === parentId);
  return parent ? `${parent.code} — ${parent.name}` : parentId;
}
