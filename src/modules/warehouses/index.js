import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listWarehousesApi,
  listActiveWarehousesApi,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  listWarehouseLocationsApi,
  listActiveWarehouseLocationsApi,
  createWarehouseLocationApi,
  createStorageLocationApi,
  updateWarehouseLocationApi,
  deleteWarehouseLocationApi,
  listWarehouseLayoutApi,
  listWarehouseLayoutStatusApi,
  createWarehouseLayoutCellApi,
  updateWarehouseLayoutCellApi,
  deleteWarehouseLayoutCellApi,
} from "./api";
import {
  listWarehousesMock,
  createWarehouseMock,
  updateWarehouseMock,
  deleteWarehouseMock,
  listWarehouseLocationsMock,
  listActiveWarehouseLocationsMock,
  createWarehouseLocationMock,
  createStorageLocationMock,
  updateWarehouseLocationMock,
  deleteWarehouseLocationMock,
  listWarehouseLayoutMock,
  listWarehouseLayoutStatusMock,
  createWarehouseLayoutCellMock,
  updateWarehouseLayoutCellMock,
  deleteWarehouseLayoutCellMock,
} from "./mock";
import { canonicalizeWarehouseType } from "./mappers";

export {
  canonicalizeWarehouseType,
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  toApiWarehousePayload,
  normalizeWarehouseLocationFromApi,
  normalizeWarehouseLocationListResponse,
  normalizeStorageLocationFromApi,
  normalizeStorageLocationListResponse,
  toApiWarehouseLocationPayload,
  toApiCreateStorageLocationPayload,
  normalizeLayoutCellFromApi,
  normalizeLayoutListResponse,
  toApiLayoutPayload,
} from "./mappers";

/** Giá trị khớp API (`Origin` / `Destination`), không có endpoint danh mục riêng. */
export const WAREHOUSE_TYPE_LABELS = {
  Origin: "Kho xuất phát",
  Destination: "Kho đích",
};

export function isWarehouseType(warehouseOrType, expected) {
  const actual =
    typeof warehouseOrType === "string" || warehouseOrType == null
      ? warehouseOrType
      : warehouseOrType.warehouseType;
  const left = canonicalizeWarehouseType(actual);
  const right = canonicalizeWarehouseType(expected);
  return Boolean(left && right && left === right);
}

/** Kho đang active và đúng loại (case-insensitive qua canonicalize). */
export function filterWarehousesByType(warehouses, warehouseType) {
  return (warehouses || []).filter(
    (entry) => entry?.isActive !== false && isWarehouseType(entry, warehouseType)
  );
}

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

export async function listActiveWarehouses() {
  if (isMockMode()) return listWarehousesMock({ isActive: true });
  return listActiveWarehousesApi();
}

export async function listActiveDestinationWarehouses() {
  const items = await listActiveWarehouses();
  const destinations = filterWarehousesByType(items, "Destination");
  return destinations.length ? destinations : items;
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

export async function listActiveWarehouseLocations(warehouseId) {
  if (isMockMode()) return listActiveWarehouseLocationsMock(warehouseId);
  return listActiveWarehouseLocationsApi(warehouseId);
}

export async function createStorageLocation(warehouseId, payload) {
  if (isMockMode()) return createStorageLocationMock(warehouseId, payload);
  return createStorageLocationApi(warehouseId, payload);
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

export async function listWarehouseLayout(warehouseId) {
  if (isMockMode()) return listWarehouseLayoutMock(warehouseId);
  return listWarehouseLayoutApi(warehouseId);
}

export async function listWarehouseLayoutStatus(warehouseId) {
  if (isMockMode()) return listWarehouseLayoutStatusMock(warehouseId);
  return listWarehouseLayoutStatusApi(warehouseId);
}

export async function createWarehouseLayoutCell(warehouseId, payload) {
  if (isMockMode()) return createWarehouseLayoutCellMock(warehouseId, payload);
  return createWarehouseLayoutCellApi(warehouseId, payload);
}

export async function updateWarehouseLayoutCell(warehouseId, layoutId, payload) {
  if (isMockMode()) return updateWarehouseLayoutCellMock(warehouseId, layoutId, payload);
  return updateWarehouseLayoutCellApi(warehouseId, layoutId, payload);
}

export async function deleteWarehouseLayoutCell(warehouseId, layoutId) {
  if (isMockMode()) return deleteWarehouseLayoutCellMock(warehouseId, layoutId);
  return deleteWarehouseLayoutCellApi(warehouseId, layoutId);
}

/** Gộp layout + status overlay theo id ô. */
export async function getWarehouseLayoutBoard(warehouseId) {
  const [layout, statusCells] = await Promise.all([
    listWarehouseLayout(warehouseId),
    listWarehouseLayoutStatus(warehouseId).catch(() => []),
  ]);

  const statusById = new Map(statusCells.map((cell) => [cell.id, cell]));
  return layout.map((cell) => {
    const status = statusById.get(cell.id);
    if (!status) return cell;
    return {
      ...cell,
      fillRatio: status.fillRatio ?? cell.fillRatio,
      hasInventory: status.hasInventory ?? cell.hasInventory,
      colorCode: status.colorCode ?? cell.colorCode,
      status: status.status ?? cell.status,
    };
  });
}

export function formatWarehouseType(type) {
  if (!type) return "—";
  const canonical = canonicalizeWarehouseType(type);
  return WAREHOUSE_TYPE_LABELS[canonical] || type;
}

export function formatLocationType(type) {
  return LOCATION_TYPE_LABELS[type] || type || "—";
}

export function getParentLocationLabel(locations, parentId) {
  if (!parentId) return "—";
  const parent = locations.find((item) => item.id === parentId);
  return parent ? `${parent.code} — ${parent.name}` : parentId;
}

export function buildLayoutGrid(cells, { minRows = 4, minCols = 6 } = {}) {
  const list = cells || [];
  if (list.length === 0 && minRows <= 0 && minCols <= 0) {
    return { rows: 0, cols: 0, grid: [] };
  }
  const maxRow = list.reduce((max, cell) => Math.max(max, cell.rowIndex ?? 0), -1);
  const maxCol = list.reduce((max, cell) => Math.max(max, cell.columnIndex ?? 0), -1);
  const rows = Math.max(minRows, maxRow + 2);
  const cols = Math.max(minCols, maxCol + 2);
  const byKey = new Map(list.map((cell) => [`${cell.rowIndex}:${cell.columnIndex}`, cell]));

  const grid = [];
  for (let row = 0; row < rows; row += 1) {
    const line = [];
    for (let col = 0; col < cols; col += 1) {
      line.push(byKey.get(`${row}:${col}`) ?? null);
    }
    grid.push(line);
  }
  return { rows, cols, grid };
}
