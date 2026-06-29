import { ROUTES } from "@/utils/appRoutes";

/** Sidebar Sales — mỗi mục là một route riêng. */
export const SALES_NAV = [
  {
    id: "dashboard",
    label: "Tổng quan",
    href: ROUTES.sales.home,
    icon: "/assets/IMG_2.svg",
  },
  {
    id: "customers",
    label: "Khách hàng",
    href: ROUTES.sales.customers,
    icon: "/assets/IMG_3.svg",
  },
  {
    id: "consignments",
    label: "Quản lý ký gửi",
    href: ROUTES.sales.consignments,
    icon: "/assets/IMG_4.svg",
  },
];

export const SALE_NAV_IDS = SALES_NAV.map((item) => item.id);
