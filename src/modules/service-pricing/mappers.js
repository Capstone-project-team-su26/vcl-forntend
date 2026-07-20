import { normalizeAdditionalServiceFeeFromApi } from "@/modules/additional-service-fees/mappers";

function normalizeServicePricingUnitType(raw) {
  const upper = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (!upper) return null;
  if (upper === "KG" || upper === "KILOGRAM") return "KG";
  if (upper === "CBM" || upper === "CM3" || upper === "CM³" || upper === "M3" || upper === "M³") {
    return "CBM";
  }
  if (
    (upper.includes("KG") && upper.includes("CBM")) ||
    (upper.includes("KG") && upper.includes("CM3"))
  ) {
    return "KG_OR_CBM";
  }
  return upper;
}

/** Local copy — avoid cycle with apiMappers (which re-exports these mappers). */
function extractGuidLocal(value) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""))) {
    return String(value);
  }
  const match = String(value ?? "").match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  return match ? match[0] : null;
}

export function normalizeServicePricingFromApi(item) {
  const serviceType = item.serviceType ?? item.service_type;
  const price = item.price ?? null;
  const pricePerKg =
    item.pricePerKg ??
    item.price_per_kg ??
    item.pricePerWeight ??
    item.price_per_weight ??
    price;
  const pricePerCbm =
    item.pricePerCbm ??
    item.price_per_cbm ??
    item.pricePerVolume ??
    item.price_per_volume ??
    null;

  return {
    id: item.id,
    carrierId: item.carrierId ?? item.carrier_id ?? "VCL",
    carrierName: item.carrierName ?? item.carrier_name ?? null,
    serviceType: serviceType ? String(serviceType).toUpperCase() : null,
    originCountry: item.originCountry ?? item.origin_country,
    destinationCountry: item.destinationCountry ?? item.destination_country,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    unitType: normalizeServicePricingUnitType(item.unitType ?? item.unit_type),
    price,
    pricePerKg,
    pricePerCbm,
    currency: item.currency ?? "VND",
    effectiveDate: item.effectiveDate ?? item.effective_date ?? null,
    isActive: item.isActive !== false && item.status !== "INACTIVE",
    boxPricingRules: (item.boxPricingRules ?? item.box_pricing_rules ?? []).map(
      normalizeAdditionalServiceFeeFromApi
    ),
  };
}

export function toApiServicePricingPayload(data) {
  const price =
    data.unitType === "KG_OR_CBM"
      ? data.pricePerKg ?? data.price
      : data.price ?? data.pricePerKg;
  const pricePerKg = data.pricePerKg ?? price;
  const pricePerCbm = data.pricePerCbm ?? null;

  const carrierId = extractGuidLocal(data.carrierId);

  return {
    carrierId: carrierId || null,
    serviceType: data.serviceType,
    originCountry: data.originCountry,
    destinationCountry: data.destinationCountry,
    unitType: data.unitType,
    price: price == null ? null : Number(price),
    pricePerWeight: pricePerKg == null ? null : Number(pricePerKg),
    pricePerVolume: pricePerCbm == null ? null : Number(pricePerCbm),
    currency: data.currency ?? "VND",
    effectiveDate: data.effectiveDate,
  };
}
