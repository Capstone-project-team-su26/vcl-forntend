const RESTRICTION_FROM_API = {
  prohibited: "PROHIBITED",
  banned: "PROHIBITED",
  restricted: "RESTRICTED",
  warning: "CONDITIONAL",
  conditional: "CONDITIONAL",
};

const RESTRICTION_TO_API = {
  PROHIBITED: "Prohibited",
  RESTRICTED: "Restricted",
  CONDITIONAL: "Warning",
};

export function normalizeRestrictedItemFromApi(item) {
  const typeKey = String(item.restrictionType || "").toLowerCase();

  return {
    id: item.id,
    name: item.itemName ?? item.name,
    country: item.country ?? null,
    restrictionType: RESTRICTION_FROM_API[typeKey] ?? item.restrictionType,
    notes: item.note ?? item.notes ?? "",
    isActive: item.isActive !== false,
  };
}

export function toApiRestrictedItemPayload(payload) {
  const restrictionType =
    RESTRICTION_TO_API[payload.restrictionType] ?? payload.restrictionType;

  return {
    itemName: payload.name?.trim(),
    country: payload.country?.trim() || null,
    restrictionType,
    note: payload.notes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}
