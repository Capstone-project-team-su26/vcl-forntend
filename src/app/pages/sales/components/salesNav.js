import { ROUTES } from "@/utils/appRoutes";

/** Sidebar Sales — mỗi mục là một route riêng. */
export const SALES_NAV = [
  {
    id: "dashboard",
    label: "Tổng quan",
    href: ROUTES.sales.home,
    icon: "lucide:layout-dashboard",
  },
  {
    id: "customers",
    label: "Khách hàng",
    href: ROUTES.sales.customers,
    icon: "lucide:users",
  },
  {
    id: "consignments",
    label: "Quản lý ký gửi",
    href: ROUTES.sales.consignments,
    icon: "lucide:package-search",
  },
  {
    id: "payments",
    label: "Lịch sử thanh toán",
    href: ROUTES.sales.payments,
    icon: "lucide:wallet",
  },
  {
    id: "purchase-requests",
    label: "Mua hộ",
    href: ROUTES.sales.purchaseRequests,
    icon: "lucide:shopping-bag",
  },
  {
    id: "messages",
    label: "Trao đổi",
    href: ROUTES.sales.messages,
    icon: "lucide:messages-square",
  },
];

export const SALE_NAV_IDS = SALES_NAV.map((item) => item.id);
