import { volumeCm3ToM3 } from "@/utils/servicePricingService";
import { normalizeConsignmentQuotationFromApi } from "./consignment.js";

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

export function normalizeServicePricingFromApi(item) {
  const serviceType = item.serviceType ?? item.service_type;

  return {
    id: item.id,
    carrierId: item.carrierId ?? item.carrier_id ?? "VCL",
    carrierName: item.carrierName ?? item.carrier_name ?? null,
    serviceType: serviceType ? String(serviceType).toUpperCase() : null,
    originCountry: item.originCountry ?? item.origin_country,
    destinationCountry: item.destinationCountry ?? item.destination_country,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    unitType: normalizeServicePricingUnitType(item.unitType ?? item.unit_type),
    price: item.price ?? null,
    pricePerKg: item.pricePerKg ?? item.price_per_kg ?? item.price ?? null,
    pricePerCbm: item.pricePerCbm ?? item.price_per_cbm ?? null,
    currency: item.currency ?? "VND",
    effectiveDate: item.effectiveDate ?? item.effective_date ?? null,
    isActive: item.isActive !== false && item.status !== "INACTIVE",
  };
}

export function toApiServicePricingPayload(data) {
  // CreateServicePricingRequest: chỉ các field swagger; carrierId phải là UUID thuần.
  const price =
    data.unitType === "KG_OR_CBM"
      ? data.pricePerKg ?? data.price
      : data.price ?? data.pricePerKg;

  const carrierId = extractGuid(data.carrierId);

  return {
    carrierId: carrierId || null,
    serviceType: data.serviceType,
    originCountry: data.originCountry,
    destinationCountry: data.destinationCountry,
    unitType: data.unitType,
    price: price == null ? null : Number(price),
    currency: data.currency ?? "VND",
    effectiveDate: data.effectiveDate,
  };
}

export function normalizeEstimateQuotationResponse(raw) {
  const item = raw?.data ?? raw?.quotation ?? raw;
  const quotation = normalizeConsignmentQuotationFromApi(item.quotation ?? item);

  return {
    quotationId: item.quotationId ?? quotation?.quotationId ?? item.id,
    orderId: item.orderId,
    status: item.status ?? quotation?.status,
    totalWeight: item.totalWeight ?? quotation?.totalWeight,
    totalVolume: item.totalVolume ?? quotation?.totalVolume,
    volumetricWeight: item.volumetricWeight,
    chargeableWeight: item.chargeableWeight,
    estimatedFreightCharge:
      item.estimatedFreightCharge ?? quotation?.estimatedFreightCharge ?? item.mainServiceAmount,
    serviceFee: item.serviceFee ?? quotation?.serviceFee ?? item.additionalTotal,
    importTax: item.importTax ?? quotation?.importTax ?? 0,
    vat: item.vat ?? quotation?.vat ?? 0,
    taxAndDuty: item.taxAndDuty ?? quotation?.taxAndDuty ?? 0,
    totalEstimatedCost:
      item.totalEstimatedCost ?? quotation?.totalEstimatedCost ?? item.total,
    quotation,
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value ?? "")
  );
}

/** Lấy UUID từ id/code dạng `CARRIER_<guid>` hoặc chuỗi có guid. */
export function extractGuid(value) {
  if (isUuid(value)) return String(value);
  const match = String(value ?? "").match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  return match ? match[0] : null;
}

/** Bỏ null/undefined — giống body Swagger (không gửi field rỗng). */
function stripNullishDeep(value) {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const items = value.map(stripNullishDeep).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => [key, stripNullishDeep(val)])
      .filter(([, val]) => val !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

function toApiAdditionalFeeDto(fee) {
  if (!fee) return null;

  const feeId = isUuid(fee.feeId) ? fee.feeId : isUuid(fee.id) ? fee.id : null;
  if (!feeId) return null;

  return {
    feeId,
    code: fee.code ?? null,
    label: fee.label ?? null,
    amount: Number(fee.amount) || 0,
    enabled: fee.enabled !== false,
  };
}

function toApiQuotationDetailsDto(quotation, fallbackSalesNote = "") {
  if (!quotation) return null;

  const additionalFees = (quotation.additionalFees ?? [])
    .map(toApiAdditionalFeeDto)
    .filter(Boolean);

  const salesNote = quotation.salesNote?.trim() || fallbackSalesNote?.trim() || "";

  const details = {
    servicePricingId: isUuid(quotation.servicePricingId) ? quotation.servicePricingId : null,
    serviceType: quotation.serviceType ?? null,
    originCountry: quotation.originCountry ?? null,
    destinationCountry: quotation.destinationCountry ?? null,
    unitType: quotation.unitType ?? null,
    unitPrice: quotation.unitPrice != null ? Number(quotation.unitPrice) : null,
    currency: quotation.currency ?? "VND",
    totalWeight: quotation.totalWeight != null ? Number(quotation.totalWeight) : null,
    totalVolume: quotation.totalVolume != null ? Number(quotation.totalVolume) : null,
    volumetricWeight:
      quotation.volumetricWeight != null ? Number(quotation.volumetricWeight) : null,
    chargeableWeight:
      quotation.chargeableWeight != null ? Number(quotation.chargeableWeight) : null,
    mainServiceAmount:
      quotation.mainServiceAmount != null ? Number(quotation.mainServiceAmount) : null,
    discountPercent:
      quotation.discountPercent != null ? Number(quotation.discountPercent) : null,
    subtotal: quotation.subtotal != null ? Number(quotation.subtotal) : null,
    discount: quotation.discount != null ? Number(quotation.discount) : null,
    total: quotation.total != null ? Number(quotation.total) : null,
    estimatedFreightCharge:
      quotation.estimatedFreightCharge != null
        ? Number(quotation.estimatedFreightCharge)
        : null,
    serviceFee: quotation.serviceFee != null ? Number(quotation.serviceFee) : null,
    importTax: quotation.importTax != null ? Number(quotation.importTax) : null,
    vat: quotation.vat != null ? Number(quotation.vat) : null,
    totalEstimatedCost:
      quotation.totalEstimatedCost != null ? Number(quotation.totalEstimatedCost) : null,
    salesNote,
  };

  if (additionalFees.length) {
    details.additionalFees = additionalFees;
  }

  return details;
}

function preserveRequiredQuotationFields(quotation, { salesNote, serviceType }) {
  if (!quotation) return null;

  const lean = stripNullishDeep(quotation) ?? {};

  return {
    ...lean,
    serviceType: quotation.serviceType ?? serviceType ?? lean.serviceType,
    unitType: quotation.unitType ?? lean.unitType,
    originCountry: quotation.originCountry ?? lean.originCountry,
    destinationCountry: quotation.destinationCountry ?? lean.destinationCountry,
    salesNote: quotation.salesNote?.trim() || salesNote?.trim() || lean.salesNote,
  };
}

/** Map FE draft → `CreateQuotationRequest` (Swagger + validation BE thực tế). */
export function toApiCreateQuotationRequest(payload, options = {}) {
  const { forSend = false } = options;
  const salesNote = payload.salesNote?.trim() ?? (forSend ? "" : "Báo giá tạm tính");
  const serviceType = payload.serviceType ?? payload.quotation?.serviceType ?? null;

  const request = {
    warehouseId: isUuid(payload.warehouseId) ? payload.warehouseId : null,
    servicePricingId: isUuid(payload.servicePricingId) ? payload.servicePricingId : null,
    serviceType,
    weightKg: payload.weightKg != null ? Number(payload.weightKg) : null,
    // ponytail: FE giữ cm³ (volumeCm3 / volumeM3); BE CreateQuotationRequest.VolumeM3 là m³ thật.
    volumeM3: (() => {
      const volumeCm3 =
        payload.volumeCm3 != null && payload.volumeCm3 !== ""
          ? Number(payload.volumeCm3)
          : payload.volumeM3 != null && payload.volumeM3 !== ""
            ? Number(payload.volumeM3)
            : null;
      return volumeCm3 != null && Number.isFinite(volumeCm3) ? volumeCm3ToM3(volumeCm3) : null;
    })(),
    packageCount:
      payload.packageCount != null ? Math.round(Number(payload.packageCount)) : null,
    declaredValue:
      payload.declaredValue === "" || payload.declaredValue == null
        ? null
        : Number(payload.declaredValue),
    salesNote,
  };

  const quotation = preserveRequiredQuotationFields(
    payload.quotation ? toApiQuotationDetailsDto(payload.quotation, salesNote) : null,
    { salesNote, serviceType }
  );

  const optional = stripNullishDeep({
    ...request,
    salesNote: undefined,
    serviceType: undefined,
    quotation: undefined,
  });

  const body = {
    ...(optional ?? {}),
    serviceType,
    salesNote,
  };

  if (quotation) {
    body.quotation = quotation;
  }

  return body;
}

/** @deprecated Dùng normalizeServicePricingFromApi */
export function normalizePricingRuleFromApi(item) {
  return {
    id: item.id,
    shippingServiceType: item.shippingServiceType,
    consignmentType: item.consignmentType,
    route: item.route ?? null,
    billingUnit: item.unitType ?? item.billingUnit,
    pricePerKg: item.pricePerWeight ?? item.pricePerKg ?? null,
    pricePerCbm: item.pricePerVolume ?? item.pricePerCbm ?? null,
    serviceFee: item.serviceFee ?? 0,
    isActive: item.isActive !== false,
  };
}

export function toApiPricingRulePayload(data) {
  return {
    shippingServiceType: data.shippingServiceType,
    consignmentType: data.consignmentType,
    route: data.route,
    unitType: data.billingUnit,
    pricePerWeight: data.pricePerKg ?? 0,
    pricePerVolume: data.pricePerCbm ?? null,
    serviceFee: data.serviceFee ?? 0,
    isActive: data.isActive !== false,
  };
}
