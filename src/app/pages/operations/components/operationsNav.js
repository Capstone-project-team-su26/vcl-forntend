import { ROUTES } from "@/utils/appRoutes";

export const OPS_NAV = [
  {
    id: "dashboard",
    label: "Tổng quan vận hành",
    href: ROUTES.operations.dashboard,
    icon: "lucide:layout-dashboard",
  },
  {
    id: "consolidation",
    label: "Gom hàng",
    href: ROUTES.operations.consolidate,
    icon: "lucide:combine",
  },
  {
    id: "export-procedures",
    label: "Thủ tục xuất khô",
    href: ROUTES.operations.exportProcedures,
    icon: "lucide:clipboard-check",
  },
  {
    id: "warehouse-layout",
    label: "Sơ đồ vị trí kho",
    href: ROUTES.operations.warehouseLayout,
    icon: "lucide:map-pin",
  },
];
