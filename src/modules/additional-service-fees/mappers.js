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
    isRequired: item.isRequired === true,
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
