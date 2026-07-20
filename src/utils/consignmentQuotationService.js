import { listAdditionalServiceFees } from "@/utils/additionalServiceFeeService";
import { resolveConsignmentPackageCount } from "@/utils/apiMappers";
import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import { normalizeEstimateQuotationResponse } from "@/utils/apiMappers";
import {
  calculateChargeableWeight,
  calculateMainServiceAmount,
  calculateVolumetricWeight,
  DEFAULT_CURRENCY,
  DEFAULT_QUOTATION_VAT_RATE,
  findServicePricingForWarehouse,
  formatMoney,
  formatVatRatePercent,
  isPricingConfigRule,
  parseConsignmentRoute,
  resolveVatRate,
  resolveVolumetricDivisor,
} from "@/utils/servicePricingService";

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** @deprecated dùng resolveVatRate(pricingRules) — VAT lấy từ PricingRule. */
export const QUOTATION_VAT_RATE = DEFAULT_QUOTATION_VAT_RATE;

export { formatMoney, DEFAULT_CURRENCY, formatVatRatePercent, resolveVatRate };

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

/** Sales còn được chỉnh phí theo lựa chọn khách (chưa gửi chính thức). */
export function canEditQuotationFeeSelection(quotation, consignmentStatus) {
  if (!quotation) return true;
  if (quotation.sentAt) return false;
  const status = String(
    quotation.status || consignmentStatus || ""
  ).toUpperCase();
  if (
    status === "QUOTATION_SENT" ||
    status === "QUOTATION_CONFIRMED" ||
    status === "ACCEPTED" ||
    status === "SENT"
  ) {
    return false;
  }
  return true;
}

export function getConsignmentQuotationHeading(quotation) {
  if (!quotation) return null;
  return isDraftConsignmentQuotation(quotation) ? "Báo giá tạm tính" : "Báo giá đã gửi";
}

/** BE trả dịch vụ chính (MAIN_SERVICE) lẫn trong additionalFees — phải loại để không tính/hiển thị trùng với dòng "Dịch vụ chính". */
function isMainServiceFee(fee) {
  const code = String(fee?.code ?? "").toUpperCase();
  const feeType = String(fee?.feeType ?? fee?.ruleType ?? "").toUpperCase();
  return code === "MAIN_SERVICE" || feeType === "MAIN_SERVICE";
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

function isDomesticFee(fee) {
  const key = String(fee?.ruleType ?? fee?.code ?? fee?.ruleCode ?? "")
    .trim()
    .toUpperCase();
  // Phí vận chuyển nội địa — luôn hiện trên báo giá (BE thường gộp vào serviceFee).
  return (
    key === "DOMESTIC_FEE" ||
    key === "DOMESTIC" ||
    key.includes("DOMESTIC_FEE") ||
    key.includes("DOMESTIC")
  );
}

function shouldDefaultEnableFee(
  fee,
  { requiresInspection = false, declaredValue = 0 } = {}
) {
  if (fee.isRequired === true) return true;
  if (isDomesticFee(fee)) return true;
  // Kiểm hàng chỉ bật khi khách chọn (pricingRuleIds) hoặc rule catalog isRequired.
  if (isInspectionFee(fee)) return false;

  const ruleType = String(fee.ruleType ?? fee.code ?? "").toUpperCase();
  if (ruleType === "INSURANCE" || ruleType.includes("INSURANCE")) {
    const minDeclared = Number(fee.conditionValue);
    if (fee.conditionType === "MIN_DECLARED_VALUE" && minDeclared > 0) {
      return (Number(declaredValue) || 0) >= minDeclared;
    }
  }

  return false;
}

/**
 * Cước dịch vụ chính: ưu tiên local (đơn giá × cân/CBM) khi tính được.
 * Estimate BE chỉ dùng khi local = 0 — tránh lệch UI (vd 150k/kg × 2kg hiện 20k).
 */
export function resolvePreferredMainServiceAmount(localFreight, apiFreight) {
  const local = Number(localFreight) || 0;
  if (local > 0) return roundMoney(local);
  const api = apiFreight != null ? Number(apiFreight) : null;
  return api != null && Number.isFinite(api) ? roundMoney(api) : 0;
}

function feeMatchesSelectedIds(feeOrLine, selectedSet) {
  if (!selectedSet?.size) return false;
  const candidates = [
    feeOrLine?.feeId,
    feeOrLine?.id,
    feeOrLine?.code,
  ].filter((value) => value != null && value !== "");
  return candidates.some((value) => selectedSet.has(String(value)));
}

/** Luồng: khách chọn pricingRuleIds → Sales tính phí. DOMESTIC luôn giữ. */
export function applySelectedPricingRuleIdsToFeeLines(
  lines,
  selectedPricingRuleIds,
  { catalogFees = [], packageCount, declaredValue, mainServiceAmount } = {}
) {
  if (!Array.isArray(lines) || !Array.isArray(selectedPricingRuleIds) || !selectedPricingRuleIds.length) {
    return lines;
  }

  const selected = new Set(selectedPricingRuleIds.map(String));
  const context = { packageCount, declaredValue, mainServiceAmount };

  return lines.map((line) => {
    const catalogFee = findCatalogFee(catalogFees, line);
    const alwaysOn =
      line.isRequired === true ||
      isDomesticFee(line) ||
      (catalogFee ? isDomesticFee(catalogFee) : false);

    if (alwaysOn) {
      if (line.enabled !== false) return line;
      return catalogFee
        ? recalculateAdditionalFeeLine(catalogFee, { ...line, enabled: true }, context)
        : { ...line, enabled: true };
    }

    const enabled =
      feeMatchesSelectedIds(line, selected) ||
      (catalogFee ? feeMatchesSelectedIds(catalogFee, selected) : false);

    if ((line.enabled !== false) === enabled) return line;

    if (catalogFee) {
      return recalculateAdditionalFeeLine(catalogFee, { ...line, enabled }, context);
    }

    const amount = enabled
      ? (Number(line.unitPrice) || 0) * (Number(line.quantity) || 0)
      : 0;
    return { ...line, enabled, amount };
  });
}

/** Phí tính theo phần trăm (giá trị khai báo / dịch vụ chính) — Sales không chỉnh số lượng. */
export function isPercentageFee(fee) {
  return String(fee?.feeCalculationType ?? "").toUpperCase() === "PERCENTAGE";
}

/** Danh từ đơn vị số lượng để hiển thị (kiện / lần / ngày…). */
function feeUnitNoun(fee) {
  const raw = String(fee?.unit ?? "").toLowerCase();
  if (isPerPackageFee(fee) || raw.includes("kiện")) return "kiện";
  const afterSlash = raw.match(/\/\s*([^\s.]+)/);
  if (afterSlash) return afterSlash[1];
  if (raw.includes("ngày")) return "ngày";
  if (raw.includes("lần")) return "lần";
  return "đơn vị";
}

/** Số lượng mặc định: phí theo kiện = số kiện, còn lại = 1. Percentage không có số lượng. */
export function getFeeDefaultQuantity(fee, { packageCount = 1 } = {}) {
  if (isPercentageFee(fee)) return null;
  return isPerPackageFee(fee) ? Math.max(1, Math.round(Number(packageCount) || 1)) : 1;
}

export function calculateAdditionalFeeAmount(
  fee,
  { packageCount = 1, declaredValue = 0, mainServiceAmount = 0, quantity } = {}
) {
  if (isPercentageFee(fee)) {
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
  const qty =
    quantity != null ? Number(quantity) || 0 : getFeeDefaultQuantity(fee, { packageCount });
  return roundMoney(fixed * qty);
}

/** Diễn giải cách tính một phụ phí — dùng trên màn báo giá Sales. */
export function buildAdditionalFeeFormula(
  fee,
  { packageCount = 1, declaredValue = 0, mainServiceAmount = 0, quantity } = {}
) {
  if (!fee) return null;

  const amount = calculateAdditionalFeeAmount(fee, {
    packageCount,
    declaredValue,
    mainServiceAmount,
    quantity,
  });

  if (isPercentageFee(fee)) {
    const rate = Number(fee.percentageRate) || 0;
    const declared = Number(declaredValue) || 0;
    const base = declared > 0 ? declared : Number(mainServiceAmount) || 0;
    const baseLabel = declared > 0 ? "giá trị khai báo" : "dịch vụ chính";
    let formula = `${formatMoney(base)} (${baseLabel}) × ${rate}% = ${formatMoney(amount)}`;
    if (fee.minAmount != null && amount === roundMoney(fee.minAmount)) {
      formula += ` — áp dụng tối thiểu ${formatMoney(fee.minAmount)}`;
    }
    if (fee.maxAmount != null && amount === roundMoney(fee.maxAmount)) {
      formula += ` — áp dụng tối đa ${formatMoney(fee.maxAmount)}`;
    }
    return formula;
  }

  const fixed = Number(fee.fixedAmount) || 0;
  const qty =
    quantity != null ? Number(quantity) || 0 : getFeeDefaultQuantity(fee, { packageCount });
  return `${formatMoney(fixed)} × ${qty} ${feeUnitNoun(fee)} = ${formatMoney(amount)}`;
}

/** Dựng 1 dòng phụ phí theo mô hình đơn giá × số lượng. */
function buildFeeLine(fee, { enabled, quantity, isRequired, context }) {
  const percentage = isPercentageFee(fee);
  const qty = percentage
    ? null
    : quantity != null
      ? Number(quantity) || 0
      : getFeeDefaultQuantity(fee, { packageCount: context.packageCount });
  const amount = enabled
    ? calculateAdditionalFeeAmount(fee, { ...context, quantity: qty })
    : 0;

  return {
    feeId: fee.id,
    code: fee.code,
    label: fee.name,
    description: fee.description || fee.unit || "Phụ phí",
    feeCalculationType: percentage ? "PERCENTAGE" : "FIXED",
    unitPrice: percentage ? Number(fee.percentageRate) || 0 : Number(fee.fixedAmount) || 0,
    unitNoun: percentage ? null : feeUnitNoun(fee),
    quantity: qty,
    quantityEditable: !percentage,
    enabled,
    isRequired,
    amount,
  };
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

export function recalculateAdditionalFeeLine(fee, line, context = {}) {
  const isRequired = line.isRequired === true || fee?.isRequired === true;
  const enabled = isRequired ? true : line.enabled !== false;
  return buildFeeLine(fee, {
    enabled,
    quantity: line.quantity,
    isRequired,
    context,
  });
}

export function buildDefaultAdditionalFeeLines({
  fees,
  packageCount,
  declaredValue,
  mainServiceAmount,
  enabledFeeIds,
  quantityByFeeId,
  selectedPricingRuleIds,
  requiresInspection = false,
}) {
  const context = { packageCount, declaredValue, mainServiceAmount };
  const selectedSet =
    Array.isArray(selectedPricingRuleIds) && selectedPricingRuleIds.length
      ? new Set(selectedPricingRuleIds.map(String))
      : null;
  // ponytail: VOLUMETRIC_DIVISOR / MIN_WEIGHT là config, không phải dòng phụ phí.
  return fees
    .filter((fee) => !isMainServiceFee(fee) && !isPricingConfigRule(fee))
    .map((fee) => {
      const isRequired = fee.isRequired === true;
      const enabled = isRequired || isDomesticFee(fee)
        ? true
        : enabledFeeIds
          ? enabledFeeIds[fee.id] === true
          : selectedSet
            ? feeMatchesSelectedIds(fee, selectedSet)
            : shouldDefaultEnableFee(fee, { requiresInspection, declaredValue });
      const quantity =
        quantityByFeeId && quantityByFeeId[fee.id] != null
          ? quantityByFeeId[fee.id]
          : undefined;
      return buildFeeLine(fee, { enabled, quantity, isRequired, context });
    });
}

export function calculateQuotationVat(
  freightCharge = 0,
  serviceFee = 0,
  vatRate = DEFAULT_QUOTATION_VAT_RATE
) {
  const freight = Number(freightCharge) || 0;
  const service = Number(serviceFee) || 0;
  const rate = Number(vatRate);
  const resolved =
    Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_QUOTATION_VAT_RATE;
  return roundMoney((freight + service) * resolved);
}

/**
 * Tổng báo giá ký gửi — khớp QuotationService:
 * TotalEstimatedCost = FreightCharge + ServiceFee + ImportTax + VAT
 * VAT = (FreightCharge + ServiceFee) × vatRate (PricingRule VAT, mặc định 8%)
 * ImportTax lấy từ BE estimate (PricingRule / ProductType trên BE).
 */
export function calculateQuotationGrandTotal({
  freightCharge = 0,
  serviceFee = 0,
  importTax = 0,
  vat,
  vatRate = DEFAULT_QUOTATION_VAT_RATE,
  discountPercent = 0,
}) {
  const freight = roundMoney(freightCharge);
  const service = roundMoney(serviceFee);
  const subtotal = roundMoney(freight + service);
  const discount = roundMoney(subtotal * (Math.max(0, Number(discountPercent) || 0) / 100));
  const importTaxAmount = roundMoney(importTax);
  const resolvedVatRate =
    Number.isFinite(Number(vatRate)) && Number(vatRate) >= 0
      ? Number(vatRate)
      : DEFAULT_QUOTATION_VAT_RATE;
  const vatAmount =
    vat != null ? roundMoney(vat) : calculateQuotationVat(freight, service, resolvedVatRate);
  const total = roundMoney(subtotal - discount + importTaxAmount + vatAmount);

  return {
    freightCharge: freight,
    serviceFee: service,
    mainServiceAmount: freight,
    additionalTotal: service,
    subtotal,
    discount,
    importTax: importTaxAmount,
    vat: vatAmount,
    vatRate: resolvedVatRate,
    total,
    totalEstimatedCost: total,
  };
}

export function calculateQuotationTotal({
  mainServiceAmount = 0,
  additionalFees = [],
  discountPercent = 0,
  importTax = 0,
  vat,
  vatRate,
  pricingRules,
}) {
  const activeFees = additionalFees.filter((line) => line.enabled !== false);
  const additionalTotal = activeFees.reduce(
    (sum, line) => sum + (Number(line.amount) || 0),
    0
  );
  const resolvedVatRate =
    vatRate != null ? Number(vatRate) : resolveVatRate(pricingRules);

  return calculateQuotationGrandTotal({
    freightCharge: mainServiceAmount,
    serviceFee: additionalTotal,
    importTax,
    vat,
    vatRate: resolvedVatRate,
    discountPercent,
  });
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
  volumeCm3,
  volumeM3,
  packageCount,
  declaredValue,
  discountPercent,
  mainServiceAmountOverride,
  additionalFees,
  salesNote,
  volumetricDivisor,
  pricingRules,
  importTax,
  vat,
}) {
  const weight = Number(weightKg) || 0;
  const volume =
    volumeCm3 != null && volumeCm3 !== ""
      ? Number(volumeCm3) || 0
      : Number(volumeM3) || 0;
  const divisor =
    volumetricDivisor != null
      ? Number(volumetricDivisor)
      : resolveVolumetricDivisor(pricingRules);
  const volumetricWeight = calculateVolumetricWeight(volume, divisor);
  const chargeableWeight = calculateChargeableWeight(weight, volume, divisor);
  const mainServiceAmount =
    mainServiceAmountOverride != null && mainServiceAmountOverride !== ""
      ? roundMoney(mainServiceAmountOverride)
      : calculateMainServiceAmount(servicePricing, {
          weightKg: weight,
          volumeCm3: volume,
          volumetricDivisor: divisor,
        });

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
    importTax,
    vat,
    pricingRules,
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
    serviceFee: totals.serviceFee,
    importTax: totals.importTax,
    vat: totals.vat,
    totalEstimatedCost: totals.totalEstimatedCost,
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
    volumeCm3: params.volumeCm3 ?? params.volumeM3 ?? order.totalVolume,
    packageCount:
      params.packageCount ??
      resolveConsignmentPackageCount({
        packageCount: order.packageCount,
        items: order.items,
        quantity: order.quantity,
      }) ??
      1,
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

function findCatalogFee(catalogFees, feeRef) {
  if (!feeRef || !catalogFees?.length) return null;
  const feeId = feeRef.feeId ?? feeRef.id;
  const code = feeRef.code;
  return (
    catalogFees.find(
      (entry) =>
        entry.id === feeId ||
        entry.code === feeId ||
        (code && (entry.code === code || entry.id === code))
    ) ?? null
  );
}

/** Giữ trạng thái bật/tắt & số lượng khi map dòng API ↔ catalog (id vs code). */
export function buildEnabledFeeStateFromLines(lines, catalogFees = []) {
  const enabledFeeIds = {};
  const quantityByFeeId = {};

  for (const line of lines) {
    const catalogFee = findCatalogFee(catalogFees, line);
    const key = catalogFee?.id ?? line.feeId;
    enabledFeeIds[key] = line.enabled !== false;
    if (line.quantity != null && line.quantity !== "") {
      quantityByFeeId[key] = line.quantity;
    }
  }

  return { enabledFeeIds, quantityByFeeId };
}

function resolveLineAmountFromApiFee(fee, { enabled, context, catalogFee }) {
  if (enabled === false) return 0;

  if (catalogFee) {
    const quantity =
      fee.quantity != null && fee.quantity !== ""
        ? Number(fee.quantity) || 0
        : undefined;
    return calculateAdditionalFeeAmount(catalogFee, { ...context, quantity });
  }

  const feeCalculationType = String(fee.feeCalculationType ?? "").toUpperCase();
  const unitPrice = fee.unitPrice != null ? Number(fee.unitPrice) : null;
  const amount = Number(fee.amount) || 0;

  if (feeCalculationType === "PERCENTAGE") {
    return amount;
  }

  // FIXED: dùng cùng quy ước số lượng mặc định (=1) như dòng hiển thị,
  // tránh trả về amount=0 của BE khi quantity null/thiếu.
  if (unitPrice != null) {
    const quantity = fee.quantity != null ? Number(fee.quantity) || 0 : 1;
    return roundMoney(unitPrice * quantity);
  }

  return amount;
}

export function buildAdditionalFeeLinesFromQuotation(
  quotation,
  {
    requiresInspection = false,
    catalogFees = [],
    packageCount = 1,
    declaredValue = 0,
    mainServiceAmount = 0,
  } = {}
) {
  if (!quotation) return [];

  const context = { packageCount, declaredValue, mainServiceAmount };
  const apiFees = (quotation.additionalFees ?? []).filter(
    (fee) => !isMainServiceFee(fee) && !isPricingConfigRule(fee)
  );
  if (apiFees.length) {
    return apiFees.map((fee) => {
      const catalogFee = findCatalogFee(catalogFees, fee);
      // Chỉ khóa khi catalog/API đánh dấu isRequired — không tự ép INSPECTION.
      const isRequired =
        fee.isRequired === true || catalogFee?.isRequired === true;
      // Phí bắt buộc luôn bật — không cho Sales tắt qua API/UI.
      const enabled = isRequired ? true : fee.enabled !== false;

      if (catalogFee) {
        const line = buildFeeLine(catalogFee, {
          enabled,
          quantity: fee.quantity,
          isRequired,
          context,
        });
        return {
          ...line,
          label: fee.label ?? fee.name ?? line.label,
          description: fee.description ?? line.description,
        };
      }

      const unitPrice = fee.unitPrice != null ? Number(fee.unitPrice) : null;
      const feeCalculationType = String(fee.feeCalculationType ?? "").toUpperCase() || null;
      const quantity =
        fee.quantity != null ? Number(fee.quantity) || 0 : feeCalculationType === "PERCENTAGE" ? null : 1;
      const amount = resolveLineAmountFromApiFee(fee, { enabled, context, catalogFee: null });

      return {
        feeId: fee.feeId ?? fee.code ?? fee.id,
        code: fee.code ?? null,
        label: fee.label ?? fee.name ?? fee.code ?? "Phụ phí",
        description: fee.description ?? "",
        feeCalculationType,
        unitPrice,
        unitNoun: fee.unitNoun ?? null,
        quantity,
        quantityEditable: feeCalculationType !== "PERCENTAGE",
        amount,
        enabled,
        isRequired,
      };
    });
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

/** Bổ sung phụ phí catalog còn thiếu trên dòng API (vd. DOMESTIC_FEE BE gộp vào serviceFee). */
function mergeMissingCatalogFeeLines(apiLines, catalogFees, context) {
  if (!catalogFees?.length) return apiLines;

  const present = new Set();
  for (const line of apiLines) {
    if (line.feeId) present.add(String(line.feeId));
    if (line.code) present.add(String(line.code).toUpperCase());
  }

  const missing = catalogFees.filter((fee) => {
    if (isMainServiceFee(fee) || isPricingConfigRule(fee)) return false;
    const id = fee.id != null ? String(fee.id) : null;
    const code = fee.code != null ? String(fee.code).toUpperCase() : null;
    return !((id && present.has(id)) || (code && present.has(code)));
  });

  if (!missing.length) return apiLines;

  const catalogLines = buildDefaultAdditionalFeeLines({
    fees: missing,
    packageCount: context.packageCount,
    declaredValue: context.declaredValue,
    mainServiceAmount: context.mainServiceAmount,
    selectedPricingRuleIds: context.selectedPricingRuleIds,
    requiresInspection: context.requiresInspection,
  });

  // Bỏ dòng gộp SERVICE_FEE nếu đã tách được phụ phí catalog (tránh cộng đôi).
  const withoutAggregate = apiLines.filter(
    (line) =>
      line.feeId !== "service-fee" &&
      String(line.code ?? "").toUpperCase() !== "SERVICE_FEE"
  );

  return [...withoutAggregate, ...catalogLines];
}

export function resolveQuotationAdditionalFees({
  consignment,
  estimate,
  catalogFees = [],
  packageCount,
  declaredValue,
  mainServiceAmount,
  selectedPricingRuleIds,
}) {
  const requiresInspection = consignment?.requiresInspection === true;
  const quotationSource = estimate?.quotation ?? estimate ?? consignment?.quotation;
  const itemizedFees = quotationSource?.additionalFees;
  // Còn chỉnh được → luôn ưu tiên pricingRuleIds khách chọn (không tin snapshot BE thưa).
  const preferCustomerSelection =
    Array.isArray(selectedPricingRuleIds) &&
    selectedPricingRuleIds.length > 0 &&
    canEditQuotationFeeSelection(consignment?.quotation, consignment?.status);
  const resolvedSelectedIds = preferCustomerSelection ? selectedPricingRuleIds : undefined;
  const feeContext = {
    packageCount,
    declaredValue,
    mainServiceAmount,
    requiresInspection,
    selectedPricingRuleIds: resolvedSelectedIds,
  };

  let result;
  if (Array.isArray(itemizedFees) && itemizedFees.some((fee) => !isMainServiceFee(fee) && !isPricingConfigRule(fee))) {
    const apiLines = buildAdditionalFeeLinesFromQuotation(quotationSource, {
      requiresInspection,
      catalogFees,
      packageCount,
      declaredValue,
      mainServiceAmount,
    });
    result = {
      lines: mergeMissingCatalogFeeLines(apiLines, catalogFees, feeContext),
      fromApi: true,
    };
  } else if (catalogFees.length) {
    result = {
      lines: buildDefaultAdditionalFeeLines({
        fees: catalogFees,
        packageCount,
        declaredValue,
        mainServiceAmount,
        selectedPricingRuleIds: resolvedSelectedIds,
        requiresInspection,
      }),
      fromApi: false,
    };
  } else {
    const aggregatedLines = buildAdditionalFeeLinesFromQuotation(quotationSource, {
      requiresInspection,
      catalogFees,
      packageCount,
      declaredValue,
      mainServiceAmount,
    });
    if (aggregatedLines.length) {
      result = { lines: aggregatedLines, fromApi: true };
    } else {
      result = { lines: [], fromApi: false };
    }
  }

  if (resolvedSelectedIds?.length && result.lines.length) {
    return {
      ...result,
      lines: applySelectedPricingRuleIdsToFeeLines(result.lines, resolvedSelectedIds, {
        catalogFees,
        packageCount,
        declaredValue,
        mainServiceAmount,
      }),
    };
  }

  return result;
}

export async function estimateConsignmentQuotation(orderId, params = {}) {
  // BE đã bỏ POST /api/orders/{orderId}/quotation/estimate.
  // Tính local; nếu đã có báo giá thì đọc GET .../quotation để lấy thuế/snapshot.
  const local = await estimateConsignmentQuotationMock(orderId, params);
  if (isMockMode() || !orderId) return local;

  try {
    const raw = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}/quotation`);
    const existing = normalizeEstimateQuotationResponse(raw);
    return {
      ...local,
      quotationId: existing.quotationId ?? local.quotationId,
      orderId: existing.orderId ?? local.orderId,
      status: existing.status ?? local.status,
      // Thuế / snapshot từ báo giá đã lưu (nếu có); cước + phụ phí vẫn ưu tiên local.
      importTax: existing.importTax ?? existing.quotation?.importTax ?? local.importTax,
      vat: existing.vat ?? existing.quotation?.vat ?? local.vat,
      taxAndDuty: existing.taxAndDuty ?? local.taxAndDuty,
      volumetricWeight: existing.volumetricWeight ?? local.volumetricWeight,
      chargeableWeight: existing.chargeableWeight ?? local.chargeableWeight,
      quotation: {
        ...local.quotation,
        ...(existing.quotation ?? {}),
        // Giữ cước + phụ phí local (đơn giá × SL) — không để BE cũ ghi đè.
        mainServiceAmount: local.quotation?.mainServiceAmount,
        estimatedFreightCharge: local.estimatedFreightCharge,
        additionalFees:
          local.quotation?.additionalFees ?? existing.quotation?.additionalFees,
        serviceFee: local.quotation?.serviceFee ?? existing.quotation?.serviceFee,
      },
      estimatedFreightCharge: local.estimatedFreightCharge,
      serviceFee: local.serviceFee,
      totalEstimatedCost: local.totalEstimatedCost,
    };
  } catch {
    // 404 = chưa có báo giá — dùng local thuần.
    return local;
  }
}

export function resolveInitialSalesNote(consignment) {
  // Chỉ dùng lại salesNote đã lập trước đó; KHÔNG đổ notes của đơn ký gửi
  // (ghi chú khách) vào ô "Ghi chú tư vấn" của Sales — notes hiển thị riêng.
  return consignment?.quotation?.salesNote?.trim() || "";
}

export function getQuotationDisplayLines(quotation) {
  if (!quotation) return [];

  const additionalFees = (quotation.additionalFees ?? []).filter(
    (fee) => !isMainServiceFee(fee) && !isPricingConfigRule(fee)
  );
  const enabledFees = additionalFees.filter((fee) => fee.enabled !== false);
  const additionalTotal = enabledFees.reduce(
    (sum, fee) => sum + (Number(fee.amount) || 0),
    0
  );
  const serviceFee = Number(quotation.serviceFee) || 0;
  const importTax = Number(quotation.importTax) || 0;
  const vat = Number(quotation.vat) || 0;
  const taxAndDuty = Number(quotation.taxAndDuty) || 0;
  // BE đôi khi gộp VAT vào taxAndDuty và để vat=0.
  const resolvedVat = vat > 0 ? vat : importTax === 0 && taxAndDuty > 0 ? taxAndDuty : 0;

  if (
    quotation.estimatedFreightCharge != null ||
    serviceFee > 0 ||
    additionalTotal > 0 ||
    importTax !== 0 ||
    resolvedVat !== 0
  ) {
    const lines = [];

    if (quotation.estimatedFreightCharge != null) {
      lines.push({
        label: "Cước vận chuyển dự kiến",
        amount: quotation.estimatedFreightCharge,
      });
    }

    if (enabledFees.length) {
      for (const fee of enabledFees) {
        lines.push({
          label: fee.label || fee.name || fee.code || "Phụ phí",
          amount: fee.amount,
        });
      }
    } else if (serviceFee > 0) {
      lines.push({
        label: "Phí dịch vụ",
        amount: serviceFee,
      });
    }

    if (importTax !== 0) {
      lines.push({
        label: "Thuế nhập khẩu",
        amount: importTax,
      });
    }

    if (resolvedVat !== 0) {
      const rateLabel =
        quotation.vatRate != null ? formatVatRatePercent(quotation.vatRate) : null;
      lines.push({
        label: rateLabel ? `VAT (${rateLabel})` : vat > 0 ? "VAT" : "Thuế & phí",
        amount: resolvedVat,
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

    for (const fee of additionalFees) {
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

/** Sau send: giữ breakdown FE nếu BE trả snapshot thưa (thiếu additionalFees / lệch tổng). */
export function mergeSentQuotationSnapshot(apiQuotation, localQuotation) {
  if (!localQuotation) return apiQuotation ?? null;
  if (!apiQuotation) return localQuotation;

  const apiFees = apiQuotation.additionalFees ?? [];
  const localFees = localQuotation.additionalFees ?? [];
  const preferLocalFees =
    localFees.length > 0 &&
    (apiFees.length === 0 ||
      Math.abs((Number(apiQuotation.total) || 0) - (Number(localQuotation.total) || 0)) > 1);

  return {
    ...apiQuotation,
    ...localQuotation,
    ...apiQuotation,
    additionalFees: preferLocalFees ? localFees : apiFees.length ? apiFees : localFees,
    mainServiceAmount:
      localQuotation.mainServiceAmount ?? apiQuotation.mainServiceAmount,
    estimatedFreightCharge:
      localQuotation.estimatedFreightCharge ??
      apiQuotation.estimatedFreightCharge ??
      localQuotation.mainServiceAmount,
    serviceFee: preferLocalFees
      ? localQuotation.serviceFee ?? apiQuotation.serviceFee
      : apiQuotation.serviceFee ?? localQuotation.serviceFee,
    vat: preferLocalFees
      ? localQuotation.vat ?? apiQuotation.vat
      : apiQuotation.vat ?? localQuotation.vat,
    importTax: apiQuotation.importTax ?? localQuotation.importTax,
    taxAndDuty: preferLocalFees
      ? localQuotation.vat ?? apiQuotation.taxAndDuty
      : apiQuotation.taxAndDuty ?? localQuotation.taxAndDuty,
    total: preferLocalFees
      ? localQuotation.total ?? apiQuotation.total
      : apiQuotation.total ?? localQuotation.total,
    totalEstimatedCost: preferLocalFees
      ? localQuotation.totalEstimatedCost ?? localQuotation.total ?? apiQuotation.totalEstimatedCost
      : apiQuotation.totalEstimatedCost ?? apiQuotation.total ?? localQuotation.totalEstimatedCost,
    salesNote: localQuotation.salesNote || apiQuotation.salesNote,
    sentAt: apiQuotation.sentAt ?? localQuotation.sentAt ?? new Date().toISOString(),
  };
}

// ponytail: self-check — fail nếu công thức phụ phí / thuế lệch
if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  const _fee = {
    feeCalculationType: "FIXED",
    fixedAmount: 35000,
    unit: "VND/kiện",
  };
  const _amount = calculateAdditionalFeeAmount(_fee, { packageCount: 2 });
  console.assert(
    _amount === 70000 &&
      buildAdditionalFeeFormula(_fee, { packageCount: 2 })?.includes("70.000"),
    "buildAdditionalFeeFormula mismatch"
  );

  const _tax = calculateQuotationGrandTotal({
    freightCharge: 100000,
    serviceFee: 50000,
    importTax: 20000,
    vatRate: 0.08,
  });
  console.assert(
    _tax.vat === 12000 && _tax.total === 182000,
    "calculateQuotationGrandTotal mismatch"
  );

  const _requiredLines = buildDefaultAdditionalFeeLines({
    fees: [
      {
        id: "req-1",
        code: "DOMESTIC",
        name: "Phí nội địa",
        feeCalculationType: "FIXED",
        fixedAmount: 10000,
        isRequired: true,
      },
    ],
    packageCount: 1,
    declaredValue: 0,
    mainServiceAmount: 0,
  });
  console.assert(
    _requiredLines[0]?.enabled === true &&
      _requiredLines[0]?.isRequired === true &&
      _requiredLines[0]?.amount === 10000,
    "isRequired fee must stay enabled"
  );

  const _vatFromRules = resolveVatRate([
    { ruleType: "VAT", feeCalculationType: "PERCENTAGE", percentageRate: 8 },
  ]);
  console.assert(_vatFromRules === 0.08, "resolveVatRate from PricingRule mismatch");

  console.assert(
    resolvePreferredMainServiceAmount(300000, 20000) === 300000,
    "resolvePreferredMainServiceAmount must prefer local freight"
  );
  console.assert(
    resolvePreferredMainServiceAmount(0, 20000) === 20000,
    "resolvePreferredMainServiceAmount falls back to API when local is 0"
  );
  console.assert(
    canEditQuotationFeeSelection({ status: "PENDING" }) === true &&
      canEditQuotationFeeSelection({ sentAt: "2026-01-01" }) === false &&
      canEditQuotationFeeSelection({ status: "QUOTATION_SENT" }) === false,
    "canEditQuotationFeeSelection mismatch"
  );

  const _selectedLines = buildDefaultAdditionalFeeLines({
    fees: [
      {
        id: "wood",
        code: "WOOD_CRATE",
        name: "Đóng thùng gỗ",
        feeCalculationType: "FIXED",
        fixedAmount: 35000,
      },
      {
        id: "domestic",
        code: "DOMESTIC_FEE",
        name: "Phí nội địa",
        feeCalculationType: "FIXED",
        fixedAmount: 5000,
        ruleType: "DOMESTIC_FEE",
      },
    ],
    packageCount: 1,
    declaredValue: 0,
    mainServiceAmount: 300000,
    selectedPricingRuleIds: ["wood"],
  });
  console.assert(
    _selectedLines.find((line) => line.feeId === "wood")?.enabled === true &&
      _selectedLines.find((line) => line.feeId === "domestic")?.enabled === true,
    "selectedPricingRuleIds must keep domestic fee enabled"
  );
}
