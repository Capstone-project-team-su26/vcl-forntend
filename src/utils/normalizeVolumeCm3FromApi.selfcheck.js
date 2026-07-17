/**
 * bun src/utils/normalizeVolumeCm3FromApi.selfcheck.js
 */
import {
  buildMainServicePricingBreakdown,
  calculateItemDimWeightKg,
  calculateMainServiceAmount,
  formatVolumeCm3,
  normalizeVolumeCm3FromApi,
  resolveConsignmentDimFromItems,
  resolveConsignmentTotalVolumeCm3,
} from "./servicePricingService.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(
  normalizeVolumeCm3FromApi(12000, { totalVolumeM3: 0.012 }) === 12000,
  "use totalVolume cm³"
);
assert(
  resolveConsignmentTotalVolumeCm3({ totalVolume: 900000, totalVolumeM3: 0.9 }) === 900000,
  "resolve 900000 cm³"
);
assert(formatVolumeCm3(900000) === "0,9 m³", "card shows 0,9 m³");

// Ảnh tham chiếu: DIM = (D × R × C) / 5000
// 50 × 40 × 40 / 5000 = 16 kg (cân thực 10 → tính phí 16)
assert(calculateItemDimWeightKg(50, 40, 40, 5000) === 16, "DIM 50×40×40/5000 = 16");

const fromItems = resolveConsignmentDimFromItems(
  [{ length: 50, width: 40, height: 40 }],
  5000
);
assert(fromItems?.volumetricWeight === 16, "resolve items DIM = 16");

const pricing = {
  unitType: "KG_OR_CBM",
  pricePerKg: 0.8,
  pricePerCbm: 180,
  price: null,
  originCountry: "US",
  destinationCountry: "VN",
};

const breakdownFromDims = buildMainServicePricingBreakdown(pricing, {
  weightKg: 10,
  volumeCm3: 80000,
  items: [{ length: 50, width: 40, height: 40 }],
  volumetricDivisor: 5000,
});
assert(breakdownFromDims.volumetricWeight === 16, "breakdown DIM from L×W×H = 16");
assert(breakdownFromDims.chargeableWeight === 16, "MAX(10,16)=16");
assert(
  breakdownFromDims.steps.find((step) => step.key === "dim")?.formula?.includes("50 × 40 × 40"),
  "DIM formula shows L×W×H"
);

// 900_000 cm³ = 0.9 m³; DIM = 180; byKg = 144; byCbm = 162 → 162
const amount = calculateMainServiceAmount(pricing, {
  weightKg: 120,
  volumeCm3: 900000,
  volumetricDivisor: 5000,
});
assert(amount === 162, `expected 162, got ${amount}`);

const breakdown = buildMainServicePricingBreakdown(pricing, {
  weightKg: 120,
  volumeCm3: 900000,
  volumetricDivisor: 5000,
});
assert(
  breakdown.steps.find((step) => step.key === "dim")?.formula?.includes("(Dài × Rộng × Cao)"),
  "fallback DIM formula uses D×R×C wording"
);
assert(breakdown.freightStep?.formula?.includes("/m³"), "freight uses m³ price");

console.log("normalizeVolumeCm3FromApi.selfcheck.js: ok");
