import { resolveConsignmentPackageCount } from "./apiMappers.js";
import { resolveConsignmentTotalVolumeCm3 } from "./servicePricingService.js";

const pollutedIgnored = resolveConsignmentPackageCount({
  packageCount: 5,
  items: [{ quantity: 1 }, { quantity: 1 }],
});
if (pollutedIgnored !== 2) throw new Error(`expected 2 lines, got ${pollutedIgnored}`);

const multiIgnoresPieceQty = resolveConsignmentPackageCount({
  packageCount: 99,
  items: [{ quantity: 5 }, { quantity: 1 }],
});
if (multiIgnoresPieceQty !== 2) {
  throw new Error(`expected 2 for multi-line, got ${multiIgnoresPieceQty}`);
}

const singleUsesQty = resolveConsignmentPackageCount({
  items: [{ quantity: 5 }],
});
if (singleUsesQty !== 5) throw new Error(`expected 5 for single line, got ${singleUsesQty}`);

const singleMissingQty = resolveConsignmentPackageCount({
  items: [{ productName: "A" }],
});
if (singleMissingQty !== 1) throw new Error(`expected 1, got ${singleMissingQty}`);

const noItems = resolveConsignmentPackageCount({ packageCount: 3, quantity: 9 });
if (noItems !== 3) throw new Error(`expected explicit 3, got ${noItems}`);

const vol3pkg = resolveConsignmentTotalVolumeCm3({
  totalVolume: 8,
  items: [{ length: 2, width: 2, height: 2, quantity: 3 }],
});
if (vol3pkg !== 24) throw new Error(`expected 24 cm³, got ${vol3pkg}`);

console.log("resolveConsignmentPackageCount.selfcheck ok");
