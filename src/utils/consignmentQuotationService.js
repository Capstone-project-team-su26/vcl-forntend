import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequestWithMockFallback } from "@/utils/apiClient";
import { normalizeEstimateQuotationResponse } from "@/utils/apiMappers";
import {
  calculateChargeableWeight,
  calculateMainServiceAmount,
  calculateVolumetricWeight,
  findServicePricingForWarehouse,
  formatMoney,
} from "@/utils/servicePricingService";

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export { formatMoney };

function calculateAdditionalFeeAmount(
  fee,
  { packageCount = 1, declaredValue = 0, mainServiceAmount = 0 }
) {
  if (fee.feeCalculationType === "PERCENTAGE") {
    const base = declaredValue > 0 ? declaredValue : mainServiceAmount;
    return roundMoney(base * ((Number(fee.percentageRate) || 0) / 100));
  }

  const fixed = Number(fee.fixedAmount) || 0;
  if (String(fee.unit || "").toLowerCase().includes("kiện")) {
    return roundMoney(fixed * (Number(packageCount) || 1));
  }
  return roundMoney(fixed);
}

export function listActiveAdditionalFees() {
  return getMockStore()
    .additionalServiceFees.filter((fee) => fee.isActive !== false)
    .map((fee) => ({ ...fee }));
}

export function buildDefaultAdditionalFeeLines({
  fees,
  packageCount,
  declaredValue,
  mainServiceAmount,
  enabledFeeIds,
}) {
  return fees.map((fee) => {
    const enabled = enabledFeeIds ? enabledFeeIds[fee.id] !== false : fee.code === "INSPECTION";
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
      isRequired: fee.code === "INSPECTION",
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
    currency: servicePricing?.currency ?? "USD",
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

export async function estimateConsignmentQuotation(orderId, params = {}) {
  if (isMockMode()) return estimateConsignmentQuotationMock(orderId, params);

  const raw = await apiRequestWithMockFallback(
    `/api/orders/${encodeURIComponent(orderId)}/quotation/estimate`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
    () => estimateConsignmentQuotationMock(orderId, params)
  );

  return normalizeEstimateQuotationResponse(raw);
}

export function getQuotationDisplayLines(quotation) {
  if (!quotation) return [];

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
