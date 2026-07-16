import {
  formatProductTypeLabel,
  isProductTypeId,
} from "./productTypeService.js";

const id1 = "11111111-0000-0000-0000-000000000001";
const id7 = "11111111-0000-0000-0000-000000000007";
const unknown = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

if (!isProductTypeId(id1)) throw new Error("uuid detect");
if (isProductTypeId("Điện tử")) throw new Error("name not uuid");
if (formatProductTypeLabel(id1) !== "Điện tử") throw new Error("seed 1");
if (formatProductTypeLabel(id7) !== "Đồ chơi") throw new Error("seed 7");
if (formatProductTypeLabel(unknown) !== null) throw new Error("hide unknown guid");
if (formatProductTypeLabel("Điện tử") !== "Điện tử") throw new Error("passthrough name");
if (formatProductTypeLabel("GENERAL") !== null) throw new Error("hide GENERAL");

console.log("productTypeService.selfcheck ok");
