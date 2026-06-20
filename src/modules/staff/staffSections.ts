import { isSaleRole, isStaffRole } from "@/shared/utils/routing";

export type StaffSection = "sales" | "global-warehouse" | "domestic-warehouse";

export type SalesTab = "overview" | "consignments";

const ALL_SECTIONS: StaffSection[] = ["sales", "global-warehouse", "domestic-warehouse"];

/** Menu sidebar theo role — Sale chỉ Sales; kho chỉ warehouse. */
export function getStaffSectionsForRole(role?: string | null): StaffSection[] {
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

export function getDefaultStaffSection(role?: string | null): StaffSection {
  return getStaffSectionsForRole(role)[0] ?? "sales";
}

export function canAccessStaffArea(role?: string | null) {
  return isStaffRole(role);
}

export function canAccessSaleConsignments(role?: string | null) {
  return isSaleRole(role);
}
