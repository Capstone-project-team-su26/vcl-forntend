import {
  normalizeConsignmentDetail,
  normalizeServicePricingFromApi,
  normalizeWarehouseFromApi,
  toApiStaffConsignmentPayload,
  toApiWarehousePayload,
} from "./apiMappers.js";

const ruleId = "11111111-1111-1111-1111-111111111111";
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

const detail = normalizeConsignmentDetail({ orderId: "order-1", pricingRuleIds: [ruleId] });
if (detail.pricingRuleIds[0] !== ruleId) throw new Error("consignment rules mismatch");

console.log("swaggerContractSync.selfcheck ok");
