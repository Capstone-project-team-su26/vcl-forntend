import { RESTRICTION_FROM_API, RESTRICTION_TO_API } from "./_helpers.js";

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

export function normalizeShippingMethodFromApi(item) {
  const services = item.additionalServices ?? item.extraServices ?? [];

  return {
    id: item.id ?? item.shippingMethodId,
    code: item.code ?? item.shippingServiceType ?? item.methodCode,
    name: item.name ?? item.shippingMethodName ?? item.title ?? "—",
    description: item.description ?? item.desc ?? null,
    estimatedDeliveryTime:
      item.estimatedDeliveryTime ?? item.estimatedTime ?? item.eta ?? null,
    applicableConditions: item.applicableConditions ?? item.conditions ?? null,
    internalNotes: item.internalNotes ?? item.internalNote ?? item.note ?? null,
    isActive: item.isActive !== false,
    additionalServices: services.map((service) => ({
      id: service.id ?? service.serviceId,
      name: service.name ?? service.serviceName ?? "—",
      description: service.description ?? service.desc ?? null,
    })),
  };
}

export function toApiShippingMethodPayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    description: payload.description?.trim() || null,
    estimatedDeliveryTime: payload.estimatedDeliveryTime?.trim() || null,
    applicableConditions: payload.applicableConditions?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeShippingMethodListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeShippingMethodFromApi);
}

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

const FEE_CALCULATION_FROM_API = {
  fixed: "FIXED",
  flat: "FIXED",
  percentage: "PERCENTAGE",
  percent: "PERCENTAGE",
};

function inferFeeCodeFromPricingRule(item) {
  const ruleType = String(item.ruleType ?? "").toUpperCase();
  if (ruleType) return ruleType;

  const ruleCode = String(item.ruleCode ?? "").toUpperCase();
  if (ruleCode.includes("INSPECTION")) return "INSPECTION";
  if (ruleCode.includes("INSURANCE")) return "INSURANCE";
  if (ruleCode.includes("WOOD")) return "WOOD_BOX";
  return ruleCode.replace(/^SUR_/, "") || ruleCode || "SURCHARGE";
}

function inferRuleTypeFromFeeCode(code) {
  const upper = String(code ?? "").toUpperCase();
  if (upper.includes("INSPECTION")) return "INSPECTION";
  if (upper.includes("INSURANCE")) return "INSURANCE";
  if (upper.includes("WOOD")) return "WOOD_BOX";
  return upper.replace(/^SUR_/, "") || "SURCHARGE";
}

export function normalizeAdditionalServiceFeeFromApi(item) {
  if (item.ruleName != null || item.ruleCode != null) {
    const calculationType = String(item.calculationType ?? "FIXED").toUpperCase();
    const isPercentage = calculationType === "PERCENTAGE";

    return {
      id: item.id,
      code: inferFeeCodeFromPricingRule(item),
      name: item.ruleName ?? "—",
      feeCalculationType: isPercentage ? "PERCENTAGE" : "FIXED",
      fixedAmount: isPercentage ? null : Number(item.value) || 0,
      percentageRate: isPercentage ? Number(item.value) || 0 : null,
      unit: item.conditionType ?? null,
      description: item.description ?? null,
      isActive: String(item.status ?? "ACTIVE").toUpperCase() !== "INACTIVE",
      ruleCode: item.ruleCode ?? null,
      ruleType: item.ruleType ?? null,
      conditionType: item.conditionType ?? null,
      conditionValue: item.conditionValue ?? null,
      minAmount: item.minAmount ?? null,
      maxAmount: item.maxAmount ?? null,
      isRequired: item.isRequired === true,
      servicePricingId: item.servicePricingId ?? null,
    };
  }

  const typeKey = String(item.feeCalculationType ?? item.calculationType ?? "").toLowerCase();

  return {
    id: item.id ?? item.feeId,
    code: item.code ?? item.feeCode ?? null,
    name: item.name ?? item.feeName ?? "—",
    feeCalculationType:
      FEE_CALCULATION_FROM_API[typeKey] ?? item.feeCalculationType ?? "FIXED",
    fixedAmount:
      item.fixedAmount === "" || item.fixedAmount == null
        ? item.fixedPrice ?? null
        : Number(item.fixedAmount),
    percentageRate:
      item.percentageRate === "" || item.percentageRate == null
        ? item.percentage ?? item.rate ?? null
        : Number(item.percentageRate),
    unit: item.unit ?? item.billingUnit ?? null,
    description: item.description ?? item.notes ?? null,
    isActive: item.isActive !== false,
  };
}

export function normalizeAdditionalServiceFeeListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeAdditionalServiceFeeFromApi);
}

export function toApiAdditionalServiceFeePayload(payload) {
  const feeCalculationType = payload.feeCalculationType || "FIXED";

  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    feeCalculationType,
    fixedAmount:
      feeCalculationType === "FIXED"
        ? payload.fixedAmount === "" || payload.fixedAmount == null
          ? 0
          : Number(payload.fixedAmount)
        : null,
    percentageRate:
      feeCalculationType === "PERCENTAGE"
        ? payload.percentageRate === "" || payload.percentageRate == null
          ? 0
          : Number(payload.percentageRate)
        : null,
    unit: payload.unit?.trim() || null,
    description: payload.description?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

/** Map form phụ phí FE → `CreatePricingRuleRequest` / `UpdatePricingRuleRequest`. */
export function toApiPricingRuleFromAdditionalFeePayload(payload) {
  const feeCalculationType = String(payload.feeCalculationType || "FIXED").toUpperCase();
  const isPercentage = feeCalculationType === "PERCENTAGE";
  const ruleCode = (payload.ruleCode ?? payload.code)?.trim();
  const ruleType = payload.ruleType ?? inferRuleTypeFromFeeCode(ruleCode);

  return {
    servicePricingId: payload.servicePricingId ?? null,
    ruleName: payload.name?.trim(),
    ruleCode,
    ruleType,
    conditionType: payload.conditionType ?? (payload.unit?.trim() || null),
    conditionValue: payload.conditionValue ?? null,
    calculationType: isPercentage ? "PERCENTAGE" : "FIXED",
    value: isPercentage
      ? Number(payload.percentageRate) || 0
      : Number(payload.fixedAmount) || 0,
    minAmount: isPercentage ? (payload.minAmount ?? null) : null,
    maxAmount: isPercentage ? (payload.maxAmount ?? null) : null,
    isRequired: payload.isRequired === true,
    status: payload.isActive !== false ? "ACTIVE" : "INACTIVE",
    description: payload.description?.trim() || null,
  };
}
