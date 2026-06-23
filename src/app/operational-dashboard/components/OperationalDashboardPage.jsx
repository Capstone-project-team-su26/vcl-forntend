"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as operationsService from "@/utils/operationsService";
function OperationalDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    operationsService.getOperationalDashboard().then((data) => {
      if (active) {
        setDashboard(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const recentActivity = dashboard?.recentActivity ?? [];
  const stats = dashboard?.stats ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-ink", children: [
    /* @__PURE__ */ jsx("aside", { className: `fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-muted transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
      /* @__PURE__ */ jsx("div", { className: "h-16 flex items-center px-6 border-b border-surface-muted", children: /* @__PURE__ */ jsx(AppLogo, {}) }),
      /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-4 py-6 space-y-2", children: [
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2.5 bg-primary/10 rounded-lg text-primary font-semibold text-sm", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.svg", className: "w-5 h-5", alt: "Dashboard" }),
          "Dashboard"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_3.svg", className: "w-5 h-5", alt: "Transfer" }),
          "Transfer Package"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_4.svg", className: "w-5 h-5", alt: "Track" }),
          "Track & Receive"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_5.svg", className: "w-5 h-5", alt: "Pricing" }),
          "Pricing & Services"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-surface-muted space-y-1", children: [
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-2 text-muted hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_6.svg", className: "w-5 h-5", alt: "Settings" }),
          "Settings"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-2 text-danger hover:bg-red-50 rounded-lg font-medium text-sm transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_7.svg", className: "w-5 h-5", alt: "Sign Out" }),
          "Sign Out"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white border-b border-surface-muted flex items-center justify-between px-4 lg:px-8 shrink-0", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "lg:hidden p-2 text-gray-600", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center ml-auto gap-4 lg:gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_9.svg", className: "w-5 h-5 text-ink", alt: "Notifications" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-2 h-2 bg-danger border-2 border-white rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-surface-muted hidden sm:block" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right hidden sm:block", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold leading-none", children: "Alex Henderson" }),
              /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted mt-1", children: "Premium Member" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative w-9 h-9", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_8.webp", className: "w-full h-full rounded-full object-cover", alt: "User" }),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-white rounded-full" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl lg:text-4xl font-black tracking-tight", children: [
              "Welcome back, ",
              /* @__PURE__ */ jsx("span", { className: "text-secondary font-sans uppercase-none", children: dashboard?.userName || "User" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted text-lg font-medium mt-2", children: [
              "You have ",
              /* @__PURE__ */ jsxs("span", { className: "text-primary font-bold", children: [
                dashboard?.activeShipments ?? 0,
                " active shipments"
              ] }),
              " in transit today."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-center gap-3 bg-primary text-white px-6 py-2.5 rounded-lg shadow-[0px_2px_4px_0px_#9ECAD633] font-bold text-sm hover:bg-primary-hover transition-colors w-full lg:w-auto", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", className: "w-4 h-4 brightness-0 invert", alt: "Map" }),
            "View Map Tracking"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: stats.map((stat, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012] flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[14px] font-medium text-muted tracking-wider uppercase", children: stat.label }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold font-['Oswald'] mt-2", children: stat.value }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted mt-2 font-medium", children: stat.sub })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center`, children: /* @__PURE__ */ jsx("img", { src: stat.icon, className: "w-6 h-6", alt: stat.label }) })
        ] }, i)) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-primary p-6 rounded-xl flex items-center gap-6 relative group cursor-pointer", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", className: "w-8 h-8 brightness-0 invert", alt: "Add" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-white text-xl font-bold font-['Oswald']", children: "Start New Transfer" }),
              /* @__PURE__ */ jsx("p", { className: "text-white/80 text-sm font-medium mt-1", children: "Calculate rates and ship your package instantly." })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity", alt: "Arrow" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-secondary p-6 rounded-xl flex items-center gap-6 relative group cursor-pointer", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", className: "w-8 h-8 brightness-0 invert", alt: "Search" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-white text-xl font-bold font-['Oswald']", children: "Track Shipment" }),
              /* @__PURE__ */ jsx("p", { className: "text-white/80 text-sm font-medium mt-1", children: "Enter a tracking ID to get real-time updates." })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity", alt: "Arrow" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-8 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold font-['Oswald']", children: "Recent Activity" }),
              /* @__PURE__ */ jsx("button", { className: "px-4 py-2 border border-secondary/30 rounded-lg text-secondary font-bold text-sm hover:bg-gray-50 transition-colors", children: "View All Activity" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-50", children: [
                /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Tracking ID" }),
                /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Recipient" }),
                /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Destination" }),
                /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Status" }),
                /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-right", children: "Est. Delivery" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-50", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-8 text-center text-sm text-muted", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." }) }) : recentActivity.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
                /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-secondary", children: row.id }),
                /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium", children: row.recipient }),
                /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted", children: row.destination }),
                /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-[12px] font-bold ${row.statusColor || "bg-transparent"}`, children: row.status }) }),
                /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-right", children: row.date })
              ] }, row.id)) })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-4 space-y-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold font-['Oswald']", children: "Insights" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-surface-alt p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", className: "w-5 h-5 text-insight", alt: "Trends" }),
                /* @__PURE__ */ jsx("h3", { className: "text-insight text-lg font-bold tracking-tight", children: "Surcharge Trends" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-insight/70 text-sm mb-6", children: "Global fuel adjustment rates" }),
              /* @__PURE__ */ jsx("div", { className: "relative h-44 mb-6", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", className: "w-full h-full object-contain", alt: "Chart" }) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-primary/10 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-insight text-sm font-semibold", children: "Current Rate" }),
                /* @__PURE__ */ jsx("span", { className: "bg-primary/20 text-primary px-3 py-1 rounded-full text-[12px] font-bold", children: dashboard?.fuelSurchargeRate || "\u2014" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-accent/10 p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012] flex gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", className: "w-6 h-6 brightness-0 invert", alt: "Promo" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold font-['Oswald']", children: "Holiday Promo" }),
                /* @__PURE__ */ jsxs("p", { className: "text-muted text-sm mt-1 leading-relaxed", children: [
                  "Save 15% on all Express shipments to Asia using code ",
                  /* @__PURE__ */ jsx("span", { className: "text-secondary font-bold", children: "FESTIVE15" }),
                  "."
                ] }),
                /* @__PURE__ */ jsxs("button", { className: "mt-4 flex items-center gap-2 text-secondary font-bold text-sm hover:underline", children: [
                  "Redeem Offer",
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.svg", className: "w-4 h-4", alt: "Arrow" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "h-12 bg-surface-muted/30 border-t border-surface-muted flex items-center justify-between px-4 lg:px-8 shrink-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-6", children: [
          /* @__PURE__ */ jsx("button", { className: "text-[12px] text-muted hover:text-ink", children: "Support Center" }),
          /* @__PURE__ */ jsx("button", { className: "text-[12px] text-muted hover:text-ink", children: "Terms of Service" }),
          /* @__PURE__ */ jsx("button", { className: "text-[12px] text-muted hover:text-ink", children: "Privacy Policy" })
        ] })
      ] })
    ] }),
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/20 z-40 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    )
  ] });
}
export {
  OperationalDashboardPage as default
};
