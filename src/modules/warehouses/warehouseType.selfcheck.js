/**
 * bun src/modules/warehouses/warehouseType.selfcheck.js
 */
import {
  buildLayoutGrid,
  canonicalizeWarehouseType,
  filterWarehousesByType,
  isWarehouseType,
  toApiCreateStorageLocationPayload,
  toApiLayoutPayload,
} from "./index.js";

if (canonicalizeWarehouseType("ORIGIN") !== "Origin") {
  throw new Error("ORIGIN should canonicalize to Origin");
}
if (canonicalizeWarehouseType("destination") !== "Destination") {
  throw new Error("destination should canonicalize to Destination");
}
if (!isWarehouseType({ warehouseType: "ORIGIN" }, "Origin")) {
  throw new Error("isWarehouseType should ignore casing");
}
if (isWarehouseType({ warehouseType: "Origin" }, "Destination")) {
  throw new Error("Origin must not match Destination");
}

const mixed = [
  { id: "1", warehouseType: "ORIGIN", isActive: true },
  { id: "2", warehouseType: "Destination", isActive: true },
  { id: "3", warehouseType: "destination", isActive: false },
  { id: "4", warehouseType: "Origin", isActive: true },
];

const destinations = filterWarehousesByType(mixed, "Destination");
if (destinations.length !== 1 || destinations[0].id !== "2") {
  throw new Error("filterWarehousesByType Destination should keep only active Destination");
}

const origins = filterWarehousesByType(mixed, "Origin");
if (origins.length !== 2) {
  throw new Error("filterWarehousesByType Origin should keep both ORIGIN and Origin");
}

const storage = toApiCreateStorageLocationPayload({
  zoneName: " Khu A ",
  shelfCode: "SHELF-A1",
  binCode: "BIN-A1-01",
  maxVolume: "100",
  maxWeight: "",
});
if (
  storage.zoneName !== "Khu A" ||
  storage.maxVolume !== 100 ||
  storage.maxWeight !== null ||
  storage.note !== ""
) {
  throw new Error("toApiCreateStorageLocationPayload mismatch");
}

const layout = toApiLayoutPayload({
  binId: "b1",
  rowIndex: "1",
  columnIndex: "2",
  displayLabel: " A1 ",
  layoutType: "BIN",
  status: "ACTIVE",
});
if (layout.rowIndex !== 1 || layout.columnIndex !== 2 || layout.displayLabel !== "A1") {
  throw new Error("toApiLayoutPayload mismatch");
}

const board = buildLayoutGrid([{ id: "c1", rowIndex: 0, columnIndex: 1, displayLabel: "A1" }]);
if (!board.grid[0][1] || board.grid[0][0] !== null) {
  throw new Error("buildLayoutGrid mismatch");
}

console.log("warehouseType.selfcheck: ok");
