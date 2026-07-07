import { listAdditionalServiceFees } from "@/utils/additionalServiceFeeService";
import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import { normalizeEstimateQuotationResponse, toApiCreateQuotationRequest } from "@/utils/apiMappers";
import {
  calculateChargeableWeight,
  calculateMainServiceAmount,
  calculateVolumetricWeight,
  DEFAULT_CURRENCY,
  findServicePricingForWarehouse,
  formatMoney,
  parseConsignmentRoute,
} from "@/utils/servicePricingService";

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export { formatMoney, DEFAULT_CURRENCY };

export function formatQuotationMoney(quotation, amount) {
  const value =
    amount ??
    quotation?.total ??
    quotation?.totalEstimatedCost ??
    quotation?.totalAmount ??
    null;
  return formatMoney(value);
}

export function isDraftConsignmentQuotation(quotation) {
  if (!quotation) return true;
  if (quotation.sentAt) return false;

  const status = String(quotation.status || "").toUpperCase();
  const quoteType = String(quotation.quoteType || "").toUpperCase();

  if (status === "DRAFT" || quoteType === "ESTIMATE") return true;
  if (!status && !quotation.sentAt) return true;

  return false;
}

export function getConsignmentQuotationHeading(quotation) {
  if (!quotation) return null;
  return isDraftConsignmentQuotation(quotation) ? "Báo giá tạm tính" : "Báo giá đã gửi";
}

function isInspectionFee(fee) {
  const code = String(fee?.code ?? "").toUpperCase();
  const ruleType = String(fee?.ruleType ?? "").toUpperCase();
  const ruleCode = String(fee?.ruleCode ?? "").toUpperCase();
  return (
    code === "INSPECTION" || ruleType === "INSPECTION" || ruleCode.includes("INSPECTION")
  );
}

function isPerPackageFee(fee) {
  const billingBasis = String(fee?.unit || fee?.conditionType || "").toLowerCase();
  return (
    billingBasis.includes("kiện") ||
    billingBasis.includes("package") ||
    billingBasis === "per_package"
  );
}

function shouldDefaultEnableFee(
  fee,
  { requiresInspection = false, declaredValue = 0 } = {}
) {
  if (fee.isRequired === true) return true;
  if (isInspectionFee(fee)) return requiresInspection;

  const ruleType = String(fee.ruleType ?? fee.code ?? "").toUpperCase();
  if (ruleType === "INSURANCE" || ruleType.includes("INSURANCE")) {
    const minDeclared = Number(fee.conditionValue);
    if (fee.conditionType === "MIN_DECLARED_VALUE" && minDeclared > 0) {
      return (Number(declaredValue) || 0) >= minDeclared;
    }
  }

  return false;
}

export function calculateAdditionalFeeAmount(
  fee,
  { packageCount = 1, declaredValue = 0, mainServiceAmount = 0 } = {}
) {
  if (fee.feeCalculationType === "PERCENTAGE") {
    const base = declaredValue > 0 ? declaredValue : mainServiceAmount;
    let amount = roundMoney(base * ((Number(fee.percentageRate) || 0) / 100));
    if (fee.minAmount != null) {
      amount = Math.max(amount, roundMoney(fee.minAmount));
    }
    if (fee.maxAmount != null) {
      amount = Math.min(amount, roundMoney(fee.maxAmount));
    }
    return amount;
  }

  const fixed = Number(fee.fixedAmount) || 0;
  if (isPerPackageFee(fee)) {
    return roundMoney(fixed * (Number(packageCount) || 1));
  }
  return roundMoney(fixed);
}

export async function fetchActiveAdditionalFees() {
  return listAdditionalServiceFees({ isActive: true });
}

/** @deprecated Dùng fetchActiveAdditionalFees — giữ cho mock/build nội bộ. */
export function listActiveAdditionalFees() {
  return getMockStore()
    .additionalServiceFees.filter((fee) => fee.isActive !== false)
    .map((fee) => ({ ...fee }));
}

export function recalculateAdditionalFeeLine(
  fee,
  line,
  { packageCount = 1, declaredValue = 0, mainServiceAmount = 0 } = {}
) {
  const enabled = line.enabled !== false;
  const amount = enabled
    ? calculateAdditionalFeeAmount(fee, { packageCount, declaredValue, mainServiceAmount })
    : 0;

  return { ...line, amount };
}

export function buildDefaultAdditionalFeeLines({
  fees,
  packageCount,
  declaredValue,
  mainServiceAmount,
  enabledFeeIds,
  requiresInspection = false,
}) {
  return fees.map((fee) => {
    const enabled = enabledFeeIds
      ? enabledFeeIds[fee.id] !== false
      : shouldDefaultEnableFee(fee, { requiresInspection, declaredValue });
    const amount = enabled
      ? calculateAdditionalFeeAmount(fee, { packageCount, declaredValue, mainServiceAmount })
      : 0;

    return {
      feeId: fee.id,
      code: fee.code,
      label: fee.name,
      description: fee.description || fee.unit || "Phụ phí",
      amount,
      enabled,
      isRequired:
        fee.isRequired === true || (isInspectionFee(fee) && requiresInspection),
    };
  });
}

export function calculateQuotationTotal({
  mainServiceAmount = 0,
  additionalFees = [],
  discountPercent = 0,
}) {
  const activeFees = additionalFees.filter((line) => line.enabled !== false);
  const additionalTotal = activeFees.reduce(
    (sum, line) => sum + (Number(line.amount) || 0),
    0
  );
  const subtotal = roundMoney((Number(mainServiceAmount) || 0) + additionalTotal);
  const discount = roundMoney(subtotal * (Math.max(0, Number(discountPercent) || 0) / 100));
  const total = roundMoney(subtotal - discount);

  return {
    mainServiceAmount: roundMoney(mainServiceAmount),
    additionalTotal: roundMoney(additionalTotal),
    subtotal,
    discount,
    total,
  };
}

export function resolveConsignmentServiceType(consignment) {
  const raw = consignment?.shippingOption ?? consignment?.consignmentType ?? "";
  if (!raw || raw === "—" || raw === "CONSIGNMENT") return "STANDARD";
  return String(raw).toUpperCase();
}

export function resolveServicePricingForConsignment(servicePricing, consignment) {
  const { origin, destination } = parseConsignmentRoute(consignment);
  const routeParts = [origin, destination].filter(Boolean);

  const serviceType = resolveConsignmentServiceType(consignment);

  const base =
    servicePricing ??
    (consignment
      ? {
          id: null,
          serviceType,
          originCountry: routeParts[0] ?? null,
          destinationCountry: routeParts[1] ?? null,
          unitType: "KG_OR_CBM",
          currency: DEFAULT_CURRENCY,
        }
      : null);

  if (!base) return null;

  // Ưu tiên tuyến từ yêu cầu ký gửi (BE) thay vì bảng giá/kho mặc định.
  const originCountry = origin ?? base.originCountry ?? routeParts[0] ?? null;
  const destinationCountry = destination ?? base.destinationCountry ?? routeParts[1] ?? null;

  return {
    ...base,
    serviceType: base.serviceType ?? serviceType,
    originCountry,
    destinationCountry,
    unitType: base.unitType ?? "KG_OR_CBM",
  };
}

export function buildConsignmentQuotationDraft({
  servicePricing,
  weightKg,
  volumeM3,
  packageCount,
  declaredValue,
  discountPercent,
  mainServiceAmountOverride,
  additionalFees,
  salesNote,
}) {
  const weight = Number(weightKg) || 0;
  const volume = Number(volumeM3) || 0;
  const volumetricWeight = calculateVolumetricWeight(volume);
  const chargeableWeight = calculateChargeableWeight(weight, volume);
  const mainServiceAmount =
    mainServiceAmountOverride != null && mainServiceAmountOverride !== ""
      ? roundMoney(mainServiceAmountOverride)
      : calculateMainServiceAmount(servicePricing, { weightKg: weight, volumeM3: volume });

  const feeLines =
    additionalFees ??
    buildDefaultAdditionalFeeLines({
      fees: listActiveAdditionalFees(),
      packageCount,
      declaredValue,
      mainServiceAmount,
    });

  const totals = calculateQuotationTotal({
    mainServiceAmount,
    additionalFees: feeLines,
    discountPercent,
  });

  return {
    servicePricingId: servicePricing?.id ?? null,
    serviceType: servicePricing?.serviceType ?? null,
    originCountry: servicePricing?.originCountry ?? null,
    destinationCountry: servicePricing?.destinationCountry ?? null,
    unitType: servicePricing?.unitType ?? null,
    unitPrice: servicePricing?.price ?? null,
    currency: servicePricing?.currency ?? DEFAULT_CURRENCY,
    totalWeight: weight,
    totalVolume: volume,
    volumetricWeight,
    chargeableWeight,
    mainServiceAmount,
    additionalFees: feeLines.filter((line) => line.enabled !== false),
    discountPercent: Number(discountPercent) || 0,
    salesNote: salesNote?.trim() || "",
    ...totals,
    estimatedFreightCharge: mainServiceAmount,
    serviceFee: totals.additionalTotal,
    totalEstimatedCost: totals.total,
  };
}

async function estimateConsignmentQuotationMock(orderId, params) {
  await mockDelay();

  const order = getMockStore().staffConsignments.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Không tìm thấy yêu cầu ký gửi.");
  }

  const servicePricing =
    getMockStore().servicePricings.find((entry) => entry.id === params.servicePricingId) ??
    findServicePricingForWarehouse(
      getMockStore().servicePricings,
      params.warehouseId,
      params.serviceType
    );

  if (!servicePricing) {
    throw new Error("Không tìm thấy giá dịch vụ chính cho kho/tuyến đã chọn.");
  }

  const draft = buildConsignmentQuotationDraft({
    servicePricing,
    weightKg: params.weightKg ?? order.totalWeight,
    volumeM3: params.volumeM3 ?? order.totalVolume,
    packageCount: params.packageCount ?? order.packageCount,
    declaredValue: params.declaredValue,
    discountPercent: params.discountPercent,
    mainServiceAmountOverride: params.mainServiceAmount,
    additionalFees: params.additionalFees,
    salesNote: params.salesNote,
  });

  return {
    quotationId: `QT-${orderId}`,
    orderId,
    status: "DRAFT",
    ...draft,
    quotation: draft,
  };
}

export function buildAdditionalFeeLinesFromQuotation(
  quotation,
  { requiresInspection = false } = {}
) {
  if (!quotation) return [];

  const apiFees = quotation.additionalFees ?? [];
  if (apiFees.length) {
    return apiFees.map((fee) => ({
      feeId: fee.feeId ?? fee.code ?? fee.id,
      code: fee.code ?? null,
      label: fee.label ?? fee.name ?? fee.code ?? "Phụ phí",
      description: fee.description ?? "",
      amount: Number(fee.amount) || 0,
      baseAmount: Number(fee.amount) || 0,
      enabled: fee.enabled !== false,
      isRequired:
        fee.isRequired === true ||
        (isInspectionFee({ code: fee.code }) && requiresInspection),
    }));
  }

  if (quotation.serviceFee != null && Number(quotation.serviceFee) > 0) {
    return [
      {
        feeId: "service-fee",
        code: "SERVICE_FEE",
        label: "Phí dịch vụ",
        description: "Phụ phí từ báo giá hệ thống",
        amount: Number(quotation.serviceFee),
        baseAmount: Number(quotation.serviceFee),
        enabled: true,
        isRequired: false,
      },
    ];
  }

  return [];
}

export function resolveQuotationAdditionalFees({
  consignment,
  estimate,
  catalogFees = [],
  packageCount,
  declaredValue,
  mainServiceAmount,
}) {
  const requiresInspection = consignment?.requiresInspection === true;
  const quotationSource = estimate?.quotation ?? estimate ?? consignment?.quotation;
  const itemizedFees = quotationSource?.additionalFees;

  if (Array.isArray(itemizedFees) && itemizedFees.length) {
    return {
      lines: buildAdditionalFeeLinesFromQuotation(quotationSource, {
        requiresInspection,
      }),
      fromApi: true,
    };
  }

  if (catalogFees.length) {
    return {
      lines: buildDefaultAdditionalFeeLines({
        fees: catalogFees,
        packageCount,
        declaredValue,
        mainServiceAmount,
        requiresInspection,
      }),
      fromApi: false,
    };
  }

  const aggregatedLines = buildAdditionalFeeLinesFromQuotation(quotationSource, {
    requiresInspection,
  });
  if (aggregatedLines.length) {
    return { lines: aggregatedLines, fromApi: true };
  }

  return { lines: [], fromApi: false };
}

export async function estimateConsignmentQuotation(orderId, params = {}) {
  if (isMockMode()) return estimateConsignmentQuotationMock(orderId, params);

  const apiPayload = toApiCreateQuotationRequest(params);

  const raw = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}/quotation/estimate`, {
    method: "POST",
    body: JSON.stringify(apiPayload),
  });

  return normalizeEstimateQuotationResponse(raw);
}

export function resolveInitialSalesNote(consignment) {
  return (
    consignment?.quotation?.salesNote?.trim() ||
    consignment?.notes?.trim() ||
    ""
  );
}

export function getQuotationDisplayLines(quotation) {
  if (!quotation) return [];

  const additionalFees = quotation.additionalFees ?? [];
  const enabledFees = additionalFees.filter((fee) => fee.enabled !== false);
  const additionalTotal = enabledFees.reduce(
    (sum, fee) => sum + (Number(fee.amount) || 0),
    0
  );
  const serviceFee = Number(quotation.serviceFee) || 0;

  if (
    quotation.estimatedFreightCharge != null ||
    serviceFee > 0 ||
    additionalTotal > 0 ||
    (quotation.taxAndDuty != null && Number(quotation.taxAndDuty) !== 0)
  ) {
    const lines = [];

    if (quotation.estimatedFreightCharge != null) {
      lines.push({
        label: "Cước vận chuyển dự kiến",
        amount: quotation.estimatedFreightCharge,
      });
    }

    if (serviceFee > 0) {
      lines.push({
        label: "Phí dịch vụ",
        amount: serviceFee,
      });
    } else if (enabledFees.length) {
      for (const fee of enabledFees) {
        lines.push({
          label: fee.label || fee.name || fee.code || "Phụ phí",
          amount: fee.amount,
        });
      }
    }

    if (quotation.taxAndDuty != null && Number(quotation.taxAndDuty) !== 0) {
      lines.push({
        label: "Thuế & phí",
        amount: quotation.taxAndDuty,
      });
    }

    return lines;
  }

  if (quotation.mainServiceAmount != null) {
    const lines = [
      {
        label: "Dịch vụ chính (cước ký gửi)",
        amount: quotation.mainServiceAmount,
      },
    ];

    for (const fee of quotation.additionalFees ?? []) {
      lines.push({
        label: fee.label || fee.name || fee.code,
        amount: fee.amount,
      });
    }

    return lines;
  }

  return [
    ...(quotation.lines ?? []).map((line) => ({
      label: line.label,
      amount: line.amount,
    })),
    ...(quotation.customFees ?? []).map((fee) => ({
      label: fee.label,
      amount: fee.amount,
    })),
  ];
}
