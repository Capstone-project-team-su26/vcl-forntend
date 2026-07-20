export function normalizeWarehouseFromApi(item) {
  return {
    id: item.id ?? item.warehouseId,
    name: item.name ?? item.warehouseName ?? "—",
    code: item.code ?? item.warehouseCode ?? null,
    address: item.address ?? null,
    region: item.region ?? null,
    warehouseType: item.warehouseType ?? item.type ?? null,
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

export function normalizeWarehouseLocationFromApi(item) {
  return {
    id: item.id ?? item.locationId,
    warehouseId: item.warehouseId,
    locationType: item.locationType ?? item.type,
    code: item.code ?? item.locationCode ?? null,
    name: item.name ?? item.locationName ?? "—",
    parentId: item.parentId ?? item.parentLocationId ?? null,
    capacity:
      item.capacity === "" || item.capacity == null ? null : Number(item.capacity),
    isActive: item.isActive !== false,
  };
}

export function normalizeWarehouseLocationListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeWarehouseLocationFromApi);
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
