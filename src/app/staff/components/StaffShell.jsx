"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import UserNavMenu from "@/app/components/UserNavMenu";
const SECTION_META = {
  sales: { label: "Sales", icon: "./assets/IMG_2.svg" },
  "global-warehouse": { label: "Global Warehouse", icon: "./assets/IMG_4.svg" },
  "domestic-warehouse": { label: "Domestic Warehouse", icon: "./assets/IMG_3.svg" },
  "transfer-history": { label: "Transfer History", icon: "./assets/IMG_3.svg" },
  tracking: { label: "Track package", icon: "./assets/IMG_3.svg" }
};
function StaffShell({
  activeSection,
  visibleSections,
  onSectionChange,
  children
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-open-sans text-ink", children: [
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40 bg-black/50 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 flex items-center px-6 border-b border-surface-muted shrink-0", children: /* @__PURE__ */ jsx(AppLogo, {}) }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-6 space-y-2", children: visibleSections.map((sectionId) => {
            const item = SECTION_META[sectionId];
            const isActive = sectionId === activeSection;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  onSectionChange?.(sectionId);
                  setIsSidebarOpen(false);
                },
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-100"}`,
                children: [
                  /* @__PURE__ */ jsx("img", { src: item.icon, alt: item.label, className: "w-5 h-5" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: item.label })
                ]
              },
              sectionId
            );
          }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-surface-muted", children: /* @__PURE__ */ jsx(UserNavMenu, { roleLabel: "Staff" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white border-b border-surface-muted flex items-center justify-between px-4 lg:px-8 shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsSidebarOpen(true),
            className: "lg:hidden p-2 text-gray-600",
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 ml-auto", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", className: "relative p-2 text-muted hover:text-ink", children: [
            /* @__PURE__ */ jsx(Icon, { icon: "lucide:bell", className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "hidden sm:block h-8 w-px bg-surface-muted" }),
          /* @__PURE__ */ jsx(UserNavMenu, { roleLabel: "Staff", className: "hidden lg:flex" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto custom-scrollbar bg-white", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 lg:p-8 max-w-[1200px] mx-auto", children }),
        /* @__PURE__ */ jsx("footer", { className: "mt-8 border-t border-surface-muted bg-surface-muted/30 px-4 lg:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
            /* @__PURE__ */ jsx("button", { type: "button", className: "text-[12px] text-muted hover:text-ink", children: "Support Center" }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "text-[12px] text-muted hover:text-ink", children: "Terms of Service" }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "text-[12px] text-muted hover:text-ink", children: "Privacy Policy" })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  StaffShell as default
};
