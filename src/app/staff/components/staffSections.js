import { isSaleRole, isStaffRole } from "@/utils/routing";
const ALL_SECTIONS = ["sales", "global-warehouse", "domestic-warehouse"];
function getStaffSectionsForRole(role) {
  switch (role) {
    case "Sale":
      return ["sales"];
    case "WarehouseStaff":
      return ["global-warehouse", "domestic-warehouse"];
    case "OperationsManager":
      return ALL_SECTIONS;
    default:
      return [];
  }
}
function getDefaultStaffSection(role) {
  return getStaffSectionsForRole(role)[0] ?? "sales";
}
function canAccessStaffArea(role) {
  return isStaffRole(role);
}
function canAccessSaleConsignments(role) {
  return isSaleRole(role);
}
export {
  canAccessSaleConsignments,
  canAccessStaffArea,
  getDefaultStaffSection,
  getStaffSectionsForRole
};
