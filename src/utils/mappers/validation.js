const VALIDATION_RESTRICTION_FROM_API = {
  banned: "BANNED",
  prohibited: "BANNED",
  restricted: "RESTRICTED",
  warning: "CONDITIONAL",
  conditional: "CONDITIONAL",
};

export function normalizeValidateItemsResponse(raw) {
  const data = raw?.data ?? raw;
  const items = (data?.items ?? data?.results ?? []).map((entry) => {
    const typeKey = String(entry.restrictionType ?? entry.status ?? "").toLowerCase();

    return {
      productName: entry.productName ?? entry.itemName ?? "",
      restrictionType:
        VALIDATION_RESTRICTION_FROM_API[typeKey] ?? entry.restrictionType ?? null,
      matchedItemName: entry.matchedItemName ?? entry.restrictedItemName ?? null,
      message: entry.message ?? entry.note ?? null,
    };
  });

  const hasBanned =
    data?.hasBanned === true ||
    items.some((item) => item.restrictionType === "BANNED");

  return { items, hasBanned };
}

export function toApiValidateItemsPayload({ items }) {
  return {
    items: items.map((item) => ({
      productName: item.productName?.trim(),
      productType: item.productType?.trim() || null,
      quantity: Number(item.quantity) || 1,
      estimatedSize: item.estimatedSize?.trim() || null,
      estimatedWeight:
        item.estimatedWeight === "" || item.estimatedWeight == null
          ? null
          : Number(item.estimatedWeight),
      declaredValue:
        item.declaredValue === "" || item.declaredValue == null
          ? null
          : Number(item.declaredValue),
    })),
  };
}

export function toApiStaffConsignmentPayload(payload) {
  const rawServiceType = String(
    payload.serviceType ?? payload.shippingOption ?? "STANDARD"
  ).trim();
  const shippingOption =
    !rawServiceType || rawServiceType.toUpperCase() === "CONSIGNMENT"
      ? "STANDARD"
      : rawServiceType;

  let route = payload.route?.trim() || null;
  if (!route && payload.originCountry && payload.destinationCountry) {
    route = `${String(payload.originCountry).trim()}-${String(payload.destinationCountry).trim()}`;
  }
  if (!route) {
    route = payload.warehouseCode?.trim() || "US";
  }

  const noteParts = [payload.salesNote?.trim()].filter(Boolean);

  if (payload.quotation) {
    noteParts.push(
      `Báo giá tuyến ${route}: ${payload.quotation.total} VND (${payload.quotation.lines?.length ?? 0} khoản phí)`
    );
  }

  return {
    customerId: payload.customerId,
    route,
    shippingOption,
    note: noteParts.join("\n") || null,
    requiresInspection: payload.requiresInspection ?? false,
    items: payload.items.map((item) => ({
      productName: item.productName?.trim(),
      productType: item.productType?.trim() || "GENERAL",
      quantity: Number(item.quantity) || 1,
      weight:
        item.estimatedWeight === "" || item.estimatedWeight == null
          ? payload.weightKg != null
            ? Number(payload.weightKg)
            : null
          : Number(item.estimatedWeight),
      declaredValue:
        item.declaredValue === "" || item.declaredValue == null
          ? null
          : Number(item.declaredValue),
      referenceUrl: item.referenceUrl?.trim() || null,
    })),
  };
}

export function normalizeStaffConsignmentCreateResponse(raw) {
  const data = raw?.data ?? raw;

  return {
    message: raw?.message ?? "Tạo yêu cầu ký gửi thành công.",
    orderId: data?.orderId ?? data?.id ?? null,
    consignmentCode:
      data?.consignmentCode ?? data?.orderCode ?? data?.trackingCode ?? null,
  };
}
