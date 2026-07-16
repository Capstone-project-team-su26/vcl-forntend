/**
 * Runnable check: merge + cache helpers.
 * Run: bun src/utils/consignmentDetailCache.selfcheck.js
 */
import { mergeSummaryWithDetail } from "./consignmentDetailCache.js";

const summary = {
  id: "1",
  customerName: "A",
  productNames: [],
  receiverPhone: null,
  totalWeight: 1,
};

const detail = {
  id: "1",
  customerName: "Nguyen Van A",
  receiverName: "B",
  receiverPhone: "090",
  receiverAddress: "HN",
  requiresInspection: true,
  items: [{ productName: "DAC" }, { productName: "nước" }],
  totalWeight: 11,
  totalVolume: 310,
  route: "JAPAN-VIETNAM",
};

const merged = mergeSummaryWithDetail(summary, detail);
if (merged.receiverPhone !== "090") throw new Error("phone");
if (merged.productNames.join(",") !== "DAC,nước") throw new Error("products");
if (merged.requiresInspection !== true) throw new Error("inspection");
if (merged.totalWeight !== 11) throw new Error("weight");

const passthrough = mergeSummaryWithDetail(summary, null);
if (passthrough !== summary) throw new Error("null detail");

console.log("consignmentDetailCache.selfcheck: ok");
