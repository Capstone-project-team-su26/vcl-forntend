/** Chuẩn hóa response backend VCL → shape FE đang dùng. */

export {
  normalizeUserFromApi,
  normalizeEmployeeRole,
} from "@/modules/users/mappers";
export {
  normalizeShippingMethodFromApi,
  toApiShippingMethodPayload,
  normalizeShippingMethodListResponse,
} from "@/modules/shipping-methods/mappers";
export {
  normalizeCarrierFromApi,
  toApiCarrierPayload,
  normalizeCarrierListResponse,
} from "@/modules/carriers/mappers";
export {
  normalizeAdditionalServiceFeeFromApi,
  normalizeAdditionalServiceFeeListResponse,
  toApiAdditionalServiceFeePayload,
  toApiPricingRuleFromAdditionalFeePayload,
} from "@/modules/additional-service-fees/mappers";
export {
  normalizePackageConfigurationFromApi,
  toApiPackageConfigurationPayload,
} from "@/modules/package-configurations/mappers";
export {
  normalizeRestrictedItemFromApi,
  toApiRestrictedItemPayload,
} from "@/modules/restricted-items/mappers";
export {
  normalizeServicePricingFromApi,
  toApiServicePricingPayload,
} from "@/modules/service-pricing/mappers";

export {
  normalizeWarehouseFromApi,
  normalizeWarehouseListResponse,
  toApiWarehousePayload,
  normalizeWarehouseLocationFromApi,
  normalizeWarehouseLocationListResponse,
  toApiWarehouseLocationPayload,
} from "@/modules/warehouses/mappers";

export {
  normalizeConsignmentStatus,
  preferFilledField,
  mergeConsignmentDetail,
  normalizeConsignmentSummary,
  normalizeConsignmentListResponse,
  normalizeConsignmentQuotationFromApi,
  isImageReferenceUrl,
  resolveConsignmentPackageCount,
  normalizeConsignmentDetail,
  normalizeConsignmentStatusUpdate,
  normalizeReceivingNoteFromApi,
  normalizeReceivingNoteCreateResponse,
  toApiReceivingNotePayload,
  normalizeEstimateQuotationResponse,
  toApiCreateQuotationRequest,
  normalizeValidateItemsResponse,
  toApiValidateItemsPayload,
  toApiStaffConsignmentPayload,
  normalizeStaffConsignmentCreateResponse,
} from "@/modules/consignments/mappers";

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

export {
  normalizeCustomerFromApi,
  toApiCustomerPayload,
  normalizeCustomerListResponse,
} from "@/modules/customers/mappers";

export {
  normalizePurchaseOrderFromApi,
  toApiPurchaseOrderStatusPayload,
  normalizePurchaseOrderStatusUpdate,
} from "@/modules/purchase-orders/mappers";

export {
  normalizePurchaseRequestFromApi,
  normalizePurchaseRequestListResponse,
  normalizePurchaseRequestStatusUpdate,
  toApiPurchaseRequestStatusPayload,
  toApiPurchaseRequestQuotationPayload,
  normalizePurchaseRequestQuotationResponse,
  toApiPurchaseRequestPurchaseOrderPayload,
  normalizePurchaseRequestPurchaseOrderResponse,
} from "@/modules/purchase-requests/mappers";
