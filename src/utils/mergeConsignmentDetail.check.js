/**
 * bun src/utils/mergeConsignmentDetail.check.js
 * Self-check: party fields không bị response thưa ghi đè thành "—".
 */
import {
  mergeConsignmentDetail,
  normalizeConsignmentDetail,
  preferFilledField,
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

console.log("mergeConsignmentDetail.check.js: ok");
