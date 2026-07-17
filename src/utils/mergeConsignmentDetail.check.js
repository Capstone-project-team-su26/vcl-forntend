/**
 * bun src/utils/mergeConsignmentDetail.check.js
 * Self-check: party fields không bị response thưa ghi đè thành "—".
 */
import {
  mergeConsignmentDetail,
  normalizeConsignmentDetail,
  normalizeServicePricingFromApi,
  preferFilledField,
  toApiServicePricingPayload,
} from "./apiMappers.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(preferFilledField("—", "Nguyen A") === "Nguyen A", "preferFilled keeps prev");
assert(preferFilledField("Nguyen B", "Nguyen A") === "Nguyen B", "preferFilled takes next");

const prev = {
  customerName: "Nguyen Van A",
  senderName: "Nguyen Van A",
  senderPhone: "0901",
  receiverName: null,
  customerId: "c1",
  items: [{ productName: "Box" }],
  quotation: { total: 1 },
};

const next = normalizeConsignmentDetail({
  orderId: "o1",
  status: "QUOTATION_SENT",
  customer: { name: "From Nested Name" },
});

assert(next.customerName === "From Nested Name", "mapper reads customer.name");
assert(next.senderName === "From Nested Name", "sender falls back to customer");

const recipientAlias = normalizeConsignmentDetail({
  orderId: "o2",
  recipientName: "Tran Thi B",
  recipientPhone: "0902",
  recipientAddress: "HCM",
});

assert(recipientAlias.receiverName === "Tran Thi B", "mapper reads recipientName");
assert(recipientAlias.receiverPhone === "0902", "mapper reads recipientPhone");
assert(recipientAlias.receiverAddress === "HCM", "mapper reads recipientAddress");

const merged = mergeConsignmentDetail(prev, {
  status: "QUOTATION_SENT",
  customerName: "—",
  senderName: null,
  items: [],
});

assert(merged.customerName === "Nguyen Van A", "merge keeps customerName");
assert(merged.senderName === "Nguyen Van A", "merge keeps senderName");
assert(merged.senderPhone === "0901", "merge keeps senderPhone");
assert(merged.items?.[0]?.productName === "Box", "merge keeps items when next empty");
assert(merged.status === "QUOTATION_SENT", "merge takes next status");

const apiPricing = normalizeServicePricingFromApi({
  id: "sp1",
  serviceType: "EXPRESS",
  originCountry: "CN",
  destinationCountry: "VN",
  unitType: "KG_OR_CBM",
  price: 10000,
  pricePerWeight: 10000,
  pricePerVolume: 180000,
});

assert(apiPricing.pricePerKg === 10000, "mapper reads pricePerWeight");
assert(apiPricing.pricePerCbm === 180000, "mapper reads pricePerVolume");

const pricingPayload = toApiServicePricingPayload({
  carrierId: "41bbc694-4590-49c7-aa30-6ad2f01a5c37",
  serviceType: "EXPRESS",
  originCountry: "CN",
  destinationCountry: "VN",
  unitType: "KG_OR_CBM",
  pricePerKg: 10000,
  pricePerCbm: 180000,
});

assert(pricingPayload.price === 10000, "payload keeps base price");
assert(pricingPayload.pricePerWeight === 10000, "payload sends pricePerWeight");
assert(pricingPayload.pricePerVolume === 180000, "payload sends pricePerVolume");

console.log("mergeConsignmentDetail.check.js: ok");
