import { resolveConsignmentPackageCount } from "./apiMappers.js";
import { resolveConsignmentTotalVolumeCm3 } from "./servicePricingService.js";

const singleLineIsOne = resolveConsignmentPackageCount({
  items: [{ quantity: 2 }],
});
if (singleLineIsOne !== 1) throw new Error(`expected 1 kiện, got ${singleLineIsOne}`);

const twoLines = resolveConsignmentPackageCount({
  packageCount: 99,
  items: [{ quantity: 5 }, { quantity: 1 }],
});
if (twoLines !== 2) throw new Error(`expected 2 lines, got ${twoLines}`);

const noItems = resolveConsignmentPackageCount({ packageCount: 3, quantity: 9 });
if (noItems !== 3) throw new Error(`expected explicit 3, got ${noItems}`);

// Thể tích: dùng thẳng giá trị API, không nhân quantity.
const volFromApi = resolveConsignmentTotalVolumeCm3({ totalVolume: 8 });
if (volFromApi !== 8) throw new Error(`expected 8 cm³ from API, got ${volFromApi}`);

console.log("resolveConsignmentPackageCount.selfcheck ok");
