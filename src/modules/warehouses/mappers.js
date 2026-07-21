/** BE có thể trả `ORIGIN` / `Origin` — chuẩn hóa để filter không lệch. */
export function canonicalizeWarehouseType(type) {
  if (type == null || type === "") return null;
  const key = String(type).trim().toLowerCase();
  if (key === "origin") return "Origin";
  if (key === "destination") return "Destination";
  return String(type).trim();
}

export function normalizeWarehouseFromApi(item) {
  return {
    id: item.id ?? item.warehouseId,
    name: item.name ?? item.warehouseName ?? "—",
    code: item.code ?? item.warehouseCode ?? null,
    address: item.address ?? null,
    region: item.region ?? null,
    warehouseType: canonicalizeWarehouseType(item.warehouseType ?? item.type),
    isActive: item.isActive !== false,
  };
}

export function normalizeWarehouseListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeWarehouseFromApi);
}

export function toApiWarehousePayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    address: payload.address?.trim() || null,
    region:
      payload.region === undefined
        ? undefined
        : payload.region?.trim().toUpperCase() || null,
    warehouseType: payload.warehouseType || null,
    isActive: payload.isActive !== false,
  };
}

/** CreateLocationRequestDto — tạo Zone + Shelf + Bin một lần (sức chứa ở bin). */
export function toApiCreateStorageLocationPayload(payload) {
  const maxVolume =
    payload.maxVolume === "" || payload.maxVolume == null
      ? null
      : Number(payload.maxVolume);
  const maxWeight =
    payload.maxWeight === "" || payload.maxWeight == null
      ? null
      : Number(payload.maxWeight);

  return {
    zoneName: payload.zoneName?.trim() || null,
    shelfCode: payload.shelfCode?.trim() || null,
    binCode: payload.binCode?.trim() || null,
    maxVolume: Number.isFinite(maxVolume) ? maxVolume : null,
    maxWeight: Number.isFinite(maxWeight) ? maxWeight : null,
    isActive: payload.isActive !== false,
    note: payload.note?.trim() || null,
  };
}

export function normalizeStorageLocationFromApi(item) {
  if (!item) return null;

  const binId = item.binId ?? item.bin_id ?? (item.locationType === "BIN" ? item.id : null);
  const shelfId = item.shelfId ?? item.shelf_id ?? null;
  const zoneId = item.zoneId ?? item.zone_id ?? null;

  return {
    id: item.id ?? binId ?? item.locationId,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    zoneId,
    zoneName: item.zoneName ?? item.zone_name ?? null,
    zoneCode: item.zoneCode ?? item.zone_code ?? null,
    shelfId,
    shelfCode: item.shelfCode ?? item.shelf_code ?? null,
    binId: binId ?? item.id ?? null,
    binCode: item.binCode ?? item.bin_code ?? item.code ?? null,
    maxVolume:
      item.maxVolume == null && item.max_volume == null
        ? null
        : Number(item.maxVolume ?? item.max_volume),
    maxWeight:
      item.maxWeight == null && item.max_weight == null
        ? null
        : Number(item.maxWeight ?? item.max_weight),
    currentVolume:
      item.currentVolume == null && item.current_volume == null
        ? null
        : Number(item.currentVolume ?? item.current_volume),
    isActive: item.isActive !== false,
    note: item.note ?? null,
    // legacy shape (admin modal cũ)
    locationType: item.locationType ?? item.type ?? (binId ? "BIN" : null),
    code: item.code ?? item.binCode ?? item.bin_code ?? null,
    name: item.name ?? item.binCode ?? item.zoneName ?? "—",
    parentId: item.parentId ?? item.parentLocationId ?? shelfId ?? zoneId ?? null,
    capacity:
      item.capacity === "" || item.capacity == null
        ? item.maxVolume == null && item.max_volume == null
          ? null
          : Number(item.maxVolume ?? item.max_volume)
        : Number(item.capacity),
  };
}

export function normalizeStorageLocationListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeStorageLocationFromApi).filter(Boolean);
}

/** @deprecated dùng normalizeStorageLocation* — giữ cho CRUD location cũ. */
export function normalizeWarehouseLocationFromApi(item) {
  return normalizeStorageLocationFromApi(item);
}

export function normalizeWarehouseLocationListResponse(raw) {
  return normalizeStorageLocationListResponse(raw);
}

export function toApiWarehouseLocationPayload(payload) {
  return {
    locationType: payload.locationType,
    code: payload.code?.trim(),
    name: payload.name?.trim(),
    parentId: payload.parentId || null,
    capacity:
      payload.capacity === "" || payload.capacity == null
        ? null
        : Number(payload.capacity),
    isActive: payload.isActive !== false,
  };
}

export function normalizeLayoutCellFromApi(item) {
  if (!item) return null;
  return {
    id: item.id ?? item.layoutId,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    zoneId: item.zoneId ?? item.zone_id ?? null,
    shelfId: item.shelfId ?? item.shelf_id ?? null,
    binId: item.binId ?? item.bin_id ?? null,
    rowIndex: Number(item.rowIndex ?? item.row_index ?? 0),
    columnIndex: Number(item.columnIndex ?? item.column_index ?? 0),
    displayLabel: item.displayLabel ?? item.display_label ?? "—",
    layoutType: String(item.layoutType ?? item.layout_type ?? "BIN").toUpperCase(),
    status: String(item.status ?? "ACTIVE").toUpperCase(),
    width: item.width == null ? 1 : Number(item.width),
    height: item.height == null ? 1 : Number(item.height),
    colorCode: item.colorCode ?? item.color_code ?? null,
    // status overlay (nếu BE trả kèm)
    fillRatio:
      item.fillRatio == null && item.fill_ratio == null && item.occupancy == null
        ? null
        : Number(item.fillRatio ?? item.fill_ratio ?? item.occupancy),
    hasInventory: item.hasInventory ?? item.has_inventory ?? null,
  };
}

export function normalizeLayoutListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data)
    ? data
    : data?.items ?? data?.layouts ?? data?.cells ?? [];
  return items.map(normalizeLayoutCellFromApi).filter(Boolean);
}

export function normalizeOneLayoutCellResponse(raw) {
  if (!raw) return null;
  if (raw.layout) return normalizeLayoutCellFromApi(raw.layout);
  if (raw.cell) return normalizeLayoutCellFromApi(raw.cell);
  const list = normalizeLayoutListResponse(raw);
  if (list.length) return list[0];
  return normalizeLayoutCellFromApi(raw?.data ?? raw);
}

export function toApiLayoutPayload(payload) {
  return {
    zoneId: payload.zoneId || null,
    shelfId: payload.shelfId || null,
    binId: payload.binId || null,
    rowIndex: Number(payload.rowIndex),
    columnIndex: Number(payload.columnIndex),
    displayLabel: payload.displayLabel?.trim() || "",
    layoutType: payload.layoutType || "BIN",
    status: payload.status || "ACTIVE",
    width: payload.width == null ? 1 : Number(payload.width),
    height: payload.height == null ? 1 : Number(payload.height),
    colorCode: payload.colorCode?.trim() || null,
  };
}
