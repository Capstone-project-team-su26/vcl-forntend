/**
 * ponytail: self-check status gate sau đặt cọc (WAITING_DEPOSIT → DEPOSIT_PAID).
 * Chạy: bun src/utils/normalizeConsignmentStatus.check.js
 */
import { normalizeConsignmentStatus } from "./apiMappers.js";
import { canStaffUpdateConsignmentStatus } from "./orderConsignmentService.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(normalizeConsignmentStatus("WAITING_DEPOSIT") === "WAITING_DEPOSIT", "keep deposit code");
assert(normalizeConsignmentStatus("deposit_paid") === "DEPOSIT_PAID", "case fold");
assert(canStaffUpdateConsignmentStatus("DEPOSIT_PAID") === true, "approve after deposit paid");
assert(canStaffUpdateConsignmentStatus("QUOTATION_CONFIRMED") === true, "approve after confirm");
assert(canStaffUpdateConsignmentStatus("WAITING_DEPOSIT") === false, "no approve while waiting");
assert(canStaffUpdateConsignmentStatus("PAID") === false, "full paid is later stage");

console.log("normalizeConsignmentStatus.check.js: ok");
