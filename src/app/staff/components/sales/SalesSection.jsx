"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as staffService from "@/utils/staffService";
import Link from "next/link";
const salesTabs = [
  { id: "overview", label: "T\u1ED5ng quan" },
  { id: "consignments", label: "Qu\u1EA3n l\xFD k\xFD g\u1EEDi" }
];
function SalesSection({ activeTab = "overview", onTabChange }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    staffService.getSalesWorkspace().then(setData);
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { icon: "./assets/IMG_2.svg", label: "Dashboard", active: false },
    { icon: "./assets/IMG_3.svg", label: "Transfer Package", active: false },
    { icon: "./assets/IMG_4.svg", label: "Track & Receive", active: false },
    { icon: "./assets/IMG_5.svg", label: "Pricing & Services", active: false }
  ];
  const stats = [
    { label: "PURCHASE ORDER", value: "12", subtext: "4 arriving today", icon: "./assets/IMG_11.svg", color: "bg-[#9ECAD6]/20", iconColor: "text-[#9ECAD6]" },
    { label: "IN STORAGE", value: "03", subtext: "Scheduled for tomorrow", icon: "./assets/IMG_10.svg", color: "bg-[#748DAE]/20", iconColor: "text-[#748DAE]" },
    { label: "IN SHIPMENT", value: "03", subtext: "Scheduled for tomorrow", icon: "./assets/IMG_10.svg", color: "bg-[#748DAE]/20", iconColor: "text-[#748DAE]" }
  ];
  const activities = [
    { id: "SW-90234", recipient: "Sarah Jenkins", destination: "London, UK", status: "In Transit", date: "Oct 24, 2024", statusColor: "bg-[#9ECAD6]/15 text-[#9ECAD6]" },
    { id: "SW-90112", recipient: "TechnoCorp Ltd", destination: "Tokyo, JP", status: "Delivered", date: "Oct 22, 2024", statusColor: "text-[#16181D]" },
    { id: "SW-89982", recipient: "Michael Chen", destination: "San Francisco, US", status: "Pending", date: "Oct 25, 2024", statusColor: "text-[#16181D]" },
    { id: "SW-89551", recipient: "Global Logistics", destination: "Berlin, DE", status: "On Hold", date: "Oct 21, 2024", statusColor: "bg-[#F5CBCB]/15 text-[#F5CBCB]" },
    { id: "SW-89400", recipient: "Anna Schmidt", destination: "Munich, DE", status: "Delivered", date: "Oct 20, 2024", statusColor: "text-[#16181D]" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-['Open_Sans']", children: [
    isMobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "lg:hidden fixed inset-0 bg-black/50 z-40", onClick: () => setIsMobileMenuOpen(false) }),
    /* @__PURE__ */ jsxs("aside", { className: `lg:hidden fixed inset-y-0 left-0 w-64 bg-[#F9FAFB] z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "h-16 flex items-center px-6 border-b border-[#f3f4f6]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-['Oswald'] text-xl font-black text-[#9ECAD6]", children: "SwiftShip" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIsMobileMenuOpen(false), className: "ml-auto", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:x", className: "w-6 h-6 text-gray-500" }) })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "p-4 space-y-2", children: navItems.map((item, idx) => /* @__PURE__ */ jsxs("button", { className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${item.active ? "bg-[#9ECAD6]/10 text-[#9ECAD6]" : "text-[#575E6B]"}`, children: [
        /* @__PURE__ */ jsx("img", { src: item.icon, className: "w-5 h-5", alt: "" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: item.label })
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 lg:ml-64 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsx("header", { className: "h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10", children: /* @__PURE__ */ jsx("button", { className: "lg:hidden p-2", onClick: () => setIsMobileMenuOpen(true), children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6 text-gray-600" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-8 space-y-8 overflow-x-hidden", children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-black tracking-tight text-[#16181D] font-['Oswald']", children: [
            "Welcome back, ",
            /* @__PURE__ */ jsx("span", { className: "text-[#748DAE] font-['Open_Sans'] uppercase-none", children: "Alex" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-medium text-[#575E6B] mt-2", children: [
            "You have ",
            /* @__PURE__ */ jsx("span", { className: "text-[#9ECAD6] font-bold", children: "12 Purchase Order" }),
            " in transit today."
          ] })
        ] }),
        /* @__PURE__ */ jsx("section", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: stats.map((stat, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[10px] shadow-sm border border-gray-50 flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[14px] font-medium text-[#575E6B] tracking-wider uppercase", children: stat.label }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-[#16181D] font-['Oswald'] mt-2", children: stat.value }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-[#575E6B] mt-2", children: stat.subtext })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-full ${stat.color} flex items-center justify-center`, children: /* @__PURE__ */ jsx("img", { src: stat.icon, className: `w-6 h-6 ${stat.iconColor}`, alt: "" }) })
        ] }, idx)) }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#9ECAD6] rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:opacity-95 transition-opacity group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", className: "w-8 h-8 text-white", alt: "" }) }),
            /* @__PURE__ */ jsxs(Link, { href: "/transfer", className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white font-['Oswald']", children: "Start New Transfer" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/80", children: "Calculate rates and ship your package instantly." })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", className: "w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform", alt: "" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#748DAE] rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:opacity-95 transition-opacity group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", className: "w-8 h-8 text-white", alt: "" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white font-['Oswald']", children: "Track Shipment" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/80", children: "Enter a tracking ID to get real-time updates." })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", className: "w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform", alt: "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold text-[#16181D] font-['Oswald']", children: "Recent Activity" }),
            /* @__PURE__ */ jsx("button", { className: "px-4 py-2 border border-[#748DAE]/30 rounded-lg text-sm font-bold text-[#748DAE] hover:bg-gray-50 transition-colors", children: "View All Activity" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[10px] shadow-sm border border-gray-50 overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse min-w-[800px]", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-[#16181D]", children: "Tracking ID" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-[#16181D]", children: "Recipient" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-[#16181D]", children: "Destination" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-[#16181D]", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-[#16181D] text-right", children: "Est. Delivery" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-semibold text-[#565d6d] font-['Oswald']", children: "87 \u20AB" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: activities.map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: "table-row-hover border-b border-gray-50 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-[#748DAE]", children: row.id }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-[#16181D]", children: row.recipient }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-[#575E6B]", children: row.destination }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold ${row.statusColor}`, children: row.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-[#16181D] text-right", children: row.date }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4" })
            ] }, idx)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold text-[#16181D] font-['Oswald']", children: "Report" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-[170px] mb-6", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-full h-full object-contain", alt: "Chart" }),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] py-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "16" }),
                  /* @__PURE__ */ jsx("span", { children: "12" }),
                  /* @__PURE__ */ jsx("span", { children: "8" }),
                  /* @__PURE__ */ jsx("span", { children: "4" }),
                  /* @__PURE__ */ jsx("span", { children: "0" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[-20px] left-0 right-0 flex justify-between px-8 text-[11px] text-[#16181D]", children: [
                  /* @__PURE__ */ jsx("span", { children: "Jun" }),
                  /* @__PURE__ */ jsx("span", { children: "Jul" }),
                  /* @__PURE__ */ jsx("span", { children: "Aug" }),
                  /* @__PURE__ */ jsx("span", { children: "Sep" }),
                  /* @__PURE__ */ jsx("span", { children: "Oct" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-8", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", className: "w-5 h-5 text-[#2C5B68]", alt: "" }),
                /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-[#2C5B68] tracking-tight", children: "Monthly Shipment" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-[170px] mb-6", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-full h-full object-contain", alt: "Chart" }),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] py-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "16" }),
                  /* @__PURE__ */ jsx("span", { children: "12" }),
                  /* @__PURE__ */ jsx("span", { children: "8" }),
                  /* @__PURE__ */ jsx("span", { children: "4" }),
                  /* @__PURE__ */ jsx("span", { children: "0" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[-20px] left-0 right-0 flex justify-between px-8 text-[11px] text-[#16181D]", children: [
                  /* @__PURE__ */ jsx("span", { children: "Jun" }),
                  /* @__PURE__ */ jsx("span", { children: "Jul" }),
                  /* @__PURE__ */ jsx("span", { children: "Aug" }),
                  /* @__PURE__ */ jsx("span", { children: "Sep" }),
                  /* @__PURE__ */ jsx("span", { children: "Oct" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-8", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", className: "w-5 h-5 text-[#2C5B68]", alt: "" }),
                /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-[#2C5B68] tracking-tight", children: "Monthly Purchase request" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        .table-row-hover:hover {
          background-color: rgba(241, 245, 249, 0.5);
          transition: background-color 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      ` })
  ] });
}
export {
  SalesSection as default
};
