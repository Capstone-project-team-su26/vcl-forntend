function normalizeSupportedShippingMethodsFromApi(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function normalizeCarrierFromApi(item) {
  return {
    id: item.id ?? item.carrierId,
    code: item.code ?? item.carrierCode ?? item.carrier_id,
    name: item.name ?? item.carrierName ?? item.carrier_name ?? "—",
    type: String(item.type ?? item.carrierType ?? "CARRIER").toUpperCase(),
    supportedShippingMethods: normalizeSupportedShippingMethodsFromApi(
      item.supportedShippingMethods ??
        item.supported_shipping_methods ??
        item.shippingMethods
    ),
    supportedRegions:
      item.supportedRegions ?? item.supported_regions ?? item.regions ?? null,
    contactInfo: item.contactInfo ?? item.contact_info ?? item.contact ?? null,
    internalNotes: item.internalNotes ?? item.internalNote ?? item.note ?? null,
    isActive: item.isActive !== false && item.is_active !== false,
  };
}

export function toApiCarrierPayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    type: payload.type?.trim()?.toUpperCase(),
    supportedShippingMethods: normalizeSupportedShippingMethodsFromApi(
      payload.supportedShippingMethods
    ),
    supportedRegions: payload.supportedRegions?.trim() || null,
    contactInfo: payload.contactInfo?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeCarrierListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.carriers ?? data?.items ?? [];
  return items.map(normalizeCarrierFromApi);
}
