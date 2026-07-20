import {
  normalizeConsignmentDetail,
  normalizeConsignmentQuotationFromApi,
  normalizeServicePricingFromApi,
  normalizeWarehouseFromApi,
  toApiCreateQuotationRequest,
  toApiStaffConsignmentPayload,
  toApiWarehousePayload,
} from "./apiMappers.js";
import {
  buildPackageConfigMismatchWarnings,
  isPackingFee,
  resolveCustomerPackageSelections,
} from "../modules/consignments/quotation.js";

const ruleId = "11111111-1111-1111-1111-111111111111";
const pkgId = "99999999-2222-2222-2222-222222222222";
const staffPayload = toApiStaffConsignmentPayload({
  customerId: "22222222-2222-2222-2222-222222222222",
  route: "CN-VN",
  serviceType: "STANDARD",
  requiresInspection: true,
  pricingRuleIds: [ruleId, "invalid"],
  items: [{ productName: "Loa", quantity: 1 }],
});

if ("requiresInspection" in staffPayload) throw new Error("removed Swagger field leaked");
if (staffPayload.pricingRuleIds.join() !== ruleId) throw new Error("pricingRuleIds mismatch");

const pricing = normalizeServicePricingFromApi({
  id: "pricing-1",
  boxPricingRules: [
    { id: ruleId, ruleName: "Đóng gỗ", ruleCode: "WOOD_BOX", value: 50000 },
  ],
});
if (pricing.boxPricingRules[0]?.name !== "Đóng gỗ") throw new Error("box rules mismatch");

const warehouse = normalizeWarehouseFromApi({ warehouseId: "wh-1", region: "CN" });
if (warehouse.region !== "CN") throw new Error("warehouse region response mismatch");
if (toApiWarehousePayload({ region: "jp" }).region !== "JP") {
  throw new Error("warehouse region request mismatch");
}

const detail = normalizeConsignmentDetail({
  orderId: "order-1",
  pricingRuleIds: [ruleId],
  items: [
    {
      id: "item-1",
      productName: "Loa",
      quantity: 2,
      packageConfigurationId: pkgId,
      packageConfiguration: {
        id: pkgId,
        configCode: "MEDIUM",
        configName: "Medium Box",
        length: 30,
        width: 20,
        height: 15,
        maxWeight: 5,
        packageFee: 25000,
        status: "ACTIVE",
      },
    },
  ],
});
if (detail.pricingRuleIds[0] !== ruleId) throw new Error("consignment rules mismatch");
if (detail.items[0].packageConfiguration?.code !== "MEDIUM") {
  throw new Error("packageConfiguration normalize mismatch");
}

const quotation = normalizeConsignmentQuotationFromApi({
  quotationId: "33333333-3333-3333-3333-333333333333",
  orderId: "order-1",
  consignmentCode: "KG-001",
  warehouseId: "44444444-4444-4444-4444-444444444444",
  estimatedFreightCharge: 240000,
  domesticShippingFee: 5000,
  serviceFee: 45000,
  vat: 24000,
  totalEstimatedCost: 314000,
  parcels: [
    {
      parcelId: "55555555-5555-5555-5555-555555555555",
      packageCode: "P-1",
      length: 40,
      width: 30,
      height: 20,
      actualWeight: 2,
      shippingFee: 240000,
    },
  ],
  additionalFees: [
    {
      feeId: "pack-1",
      code: "PACKING_FEE",
      feeType: "PACKING_FEE",
      label: "Phí đóng thùng (Medium Box)",
      unitPrice: 25000,
      quantity: 1,
      amount: 50000,
      enabled: true,
    },
    {
      feeId: ruleId,
      code: "WOOD_CRATE",
      label: "Đóng thùng gỗ",
      amount: 35000,
      enabled: true,
    },
  ],
});
if (quotation.domesticShippingFee !== 5000) throw new Error("domesticShippingFee normalize mismatch");
if (quotation.consignmentCode !== "KG-001") throw new Error("consignmentCode normalize mismatch");
if (quotation.parcels?.[0]?.packageCode !== "P-1") throw new Error("parcels normalize mismatch");
if (!isPackingFee(quotation.additionalFees[0])) throw new Error("isPackingFee mismatch");

const packageInfo = resolveCustomerPackageSelections(detail, quotation);
if (!packageInfo.hasCustomerSelection) throw new Error("customer package selection missing");
if (packageInfo.packingFeeTotal !== 50000) throw new Error("packingFeeTotal mismatch");

const warnings = buildPackageConfigMismatchWarnings({
  selections: packageInfo.selections,
  parcels: quotation.parcels,
});
if (!warnings.some((entry) => entry.level === "dimensions")) {
  throw new Error("expected dimensions mismatch warning");
}

const createBody = toApiCreateQuotationRequest({
  warehouseId: "44444444-4444-4444-4444-444444444444",
  serviceType: "STANDARD",
  weightKg: 2,
  salesNote: "ok",
  quotation: {
    serviceType: "STANDARD",
    unitType: "KG",
    originCountry: "CN",
    destinationCountry: "VN",
    estimatedFreightCharge: 240000,
    domesticShippingFee: 5000,
    mainServiceAmount: 240000,
    serviceFee: 45000,
    vat: 24000,
    totalEstimatedCost: 314000,
    additionalFees: [
      { feeId: ruleId, code: "WOOD_CRATE", label: "Đóng thùng gỗ", amount: 35000, enabled: true },
    ],
  },
});
if (createBody.quotation?.domesticShippingFee !== 5000) {
  throw new Error("domesticShippingFee request mismatch");
}
if (!("domesticShippingFee" in (createBody.quotation ?? {}))) {
  throw new Error("domesticShippingFee missing on CreateQuotationRequest.quotation");
}

console.log("swaggerContractSync.selfcheck ok");
