import { isSaleRole } from "@/utils/routing";
import { SALE_NAV_IDS } from "@/app/pages/sales/components/salesNav";

function getStaffSectionsForRole(role) {
  if (role === "Sale") return SALE_NAV_IDS;
  return [];
}

function getDefaultStaffSection(role) {
  return getStaffSectionsForRole(role)[0] ?? "dashboard";
}

function canAccessStaffArea(role) {
  return isSaleRole(role);
}

function canAccessSaleConsignments(role) {
  return isSaleRole(role);
}

export {
  canAccessSaleConsignments,
  canAccessStaffArea,
  getDefaultStaffSection,
  getStaffSectionsForRole,
};
