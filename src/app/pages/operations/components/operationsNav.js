import { ROUTES } from "@/utils/appRoutes";

export const OPS_NAV = [
  {
    id: "dashboard",
    label: "Dashboard vận hành",
    href: ROUTES.operations.dashboard,
    icon: "lucide:layout-dashboard",
  },
  {
    id: "consolidation",
    label: "Chức năng gom hàng",
    href: ROUTES.operations.consolidate,
    icon: "lucide:boxes",
  },
  {
    id: "warehouse-layout",
    label: "Phân bố vị trí kho",
    href: ROUTES.operations.warehouseLayout,
    icon: "lucide:map",
  },
];
