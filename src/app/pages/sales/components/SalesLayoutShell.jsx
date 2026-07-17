"use client";

import { usePathname } from "next/navigation";
import InternalShell from "@/app/components/InternalShell";
import { SALES_NAV } from "@/app/pages/sales/components/salesNav";
import { ROUTES } from "@/utils/appRoutes";

function resolveActiveNav(pathname) {
  if (!pathname) return "dashboard";
  if (pathname.startsWith(ROUTES.sales.customers)) return "customers";
  if (pathname.startsWith(ROUTES.sales.payments)) return "payments";
  if (pathname.startsWith(ROUTES.sales.purchaseRequests)) return "purchase-requests";
  if (pathname.startsWith(ROUTES.sales.messages)) return "messages";
  if (pathname.startsWith(ROUTES.sales.consignments)) return "consignments";
  return "dashboard";
}

/** Một shell duy nhất cho mọi route /pages/sales/* — tránh bọc layout trùng ở từng page. */
export default function SalesLayoutShell({ children }) {
  const pathname = usePathname();
  const activeNav = resolveActiveNav(pathname);

  return (
    <InternalShell
      navItems={SALES_NAV}
      activeNav={activeNav}
      roleLabel="Sales"
      logoHref={ROUTES.sales.home}
    >
      {children}
    </InternalShell>
  );
}
