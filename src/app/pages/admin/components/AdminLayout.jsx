"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserNavMenu from "@/app/components/UserNavMenu";
import { ROUTES } from "@/utils/appRoutes";
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
  { id: "users", label: "Users", icon: "lucide:users", href: ROUTES.admin.users },
  {
    id: "consignments",
    label: "Y\xEAu c\u1EA7u k\xFD g\u1EEDi",
    icon: "lucide:package-search",
    href: ROUTES.admin.consignments
  },
  {
    id: "restricted-items",
    label: "H\xE0ng c\u1EA5m",
    icon: "lucide:shield-alert",
    href: ROUTES.admin.restrictedItems
  },
  {
    id: "pricing-rules",
    label: "Giá DV chính",
    icon: "lucide:receipt",
    href: ROUTES.admin.pricingRules
  },
  {
    id: "warehouses",
    label: "Qu\u1EA3n l\xFD kho",
    icon: "lucide:warehouse",
    href: ROUTES.admin.warehouses
  },
  {
    id: "shipping-methods",
    label: "V\u1EADn chuy\u1EC3n",
    icon: "lucide:truck",
    href: ROUTES.admin.shippingMethods
  },
  {
    id: "carriers",
    label: "\u0110\u01A1n v\u1ECB v\u1EADn chuy\u1EC3n",
    icon: "lucide:plane",
    href: ROUTES.admin.carriers
  },
  {
    id: "additional-service-fees",
    label: "Ph\u00ED DV b\u1ED5 sung",
    icon: "lucide:layers",
    href: ROUTES.admin.additionalServiceFees
  },
  { id: "alerts", label: "Alerts", icon: "lucide:bell" },
  { id: "settings", label: "Settings", icon: "lucide:settings" }
];
function AdminLayout({ activeNav, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-surface-panel font-sans text-ink", children: [
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/40 z-40 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `fixed inset-y-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-5 border-b border-border-muted", children: /* @__PURE__ */ jsx(AppLogo, { href: ROUTES.admin.users }) }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 space-y-1", children: navItems.map((item) => {
            const isActive = item.id === activeNav;
            const className = `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-primary/15 text-insight border-l-4 border-insight pl-2" : "text-muted hover:bg-surface"}`;
            if (item.href) {
              return /* @__PURE__ */ jsxs(Link, { href: item.href, className, onClick: () => setIsSidebarOpen(false), children: [
                /* @__PURE__ */ jsx(Icon, { icon: item.icon, className: "w-5 h-5" }),
                item.label
              ] }, item.id);
            }
            return /* @__PURE__ */ jsxs("button", { type: "button", className, children: [
              /* @__PURE__ */ jsx(Icon, { icon: item.icon, className: "w-5 h-5" }),
              item.label
            ] }, item.id);
          }) }),
          /* @__PURE__ */ jsx("div", { className: "px-3 py-4 border-t border-border-muted shrink-0", children: /* @__PURE__ */ jsx(ThemeToggle, {}) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-surface-elevated border-b border-border-muted flex items-center gap-4 px-4 lg:px-8 shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "lg:hidden p-2 text-muted",
            onClick: () => setIsSidebarOpen(true),
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 lg:gap-5 ml-auto", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", className: "relative p-2 text-muted hover:text-ink", children: [
            /* @__PURE__ */ jsx(Icon, { icon: "lucide:bell", className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "p-2 text-muted hover:text-ink hidden sm:block", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:circle-help", className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden sm:block h-8 w-px bg-border-muted" }),
          /* @__PURE__ */ jsx(UserNavMenu, { roleLabel: "Admin" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-4 lg:p-8", children })
    ] })
  ] });
}
export {
  AdminLayout as default
};
