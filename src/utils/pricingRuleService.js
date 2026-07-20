/** @deprecated Import từ `@/modules/service-pricing`. Giữ file để tránh gãy import cũ. */
export {
  listServicePricings as listPricingRules,
  createServicePricing as createPricingRule,
  updateServicePricing as updatePricingRule,
  deleteServicePricing as deletePricingRule,
  SERVICE_TYPE_LABELS as SHIPPING_SERVICE_TYPE_LABELS,
  UNIT_TYPE_LABELS as BILLING_UNIT_LABELS,
  formatServicePricingRoute as formatPricingRoute,
  formatMoney,
} from "@/modules/service-pricing";
