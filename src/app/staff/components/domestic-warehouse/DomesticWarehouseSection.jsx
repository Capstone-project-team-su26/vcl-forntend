"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import * as staffService from "@/utils/staffService";
function DomesticWarehouseSection() {
  const [data, setData] = useState({ stats: [], outboundShipments: [] });
  const stats = [
    { label: "INCOMING", value: "12", subtext: "4 arriving today", icon: "./assets/IMG_11.svg", color: "bg-[#9ECAD6]/20", iconColor: "text-[#9ECAD6]" },
    { label: "IN STORAGE", value: "03", subtext: "Scheduled for tomorrow", icon: "./assets/IMG_10.svg", color: "bg-[#748DAE]/20", iconColor: "text-[#748DAE]" },
    { label: "IN SHIPMENT", value: "03", subtext: "Scheduled for tomorrow", icon: "./assets/IMG_10.svg", color: "bg-[#748DAE]/20", iconColor: "text-[#748DAE]" }
  ];
  const tableData = [
    { id: "SW-90234", recipient: "Sarah Jenkins", destination: "London, UK", status: "In Transit", date: "Oct 24, 2024", statusColor: "bg-[#9ECAD6]/15 text-[#9ECAD6]" },
    { id: "SW-90112", recipient: "TechnoCorp Ltd", destination: "Tokyo, JP", status: "Delivered", date: "Oct 22, 2024", statusColor: "text-[#16181D]" },
    { id: "SW-89982", recipient: "Michael Chen", destination: "San Francisco, US", status: "Pending", date: "Oct 25, 2024", statusColor: "text-[#16181D]" },
    { id: "SW-89551", recipient: "Global Logistics", destination: "Berlin, DE", status: "On Hold", date: "Oct 21, 2024", statusColor: "bg-[#F5CBCB]/15 text-[#F5CBCB]" },
    { id: "SW-89400", recipient: "Anna Schmidt", destination: "Munich, DE", status: "Delivered", date: "Oct 20, 2024", statusColor: "text-[#16181D]" }
  ];
  useEffect(() => {
    staffService.getDomesticWarehouseData().then(setData);
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]", children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl lg:text-4xl font-black tracking-tight text-[#16181D] normal-case", children: [
        "Welcome back, ",
        /* @__PURE__ */ jsx("span", { className: "font-sans text-[#748DAE]", children: "Alex" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg font-medium mt-2", children: [
        "You have ",
        /* @__PURE__ */ jsx("span", { className: "text-[#9ECAD6] font-bold", children: "12 Package" }),
        " incoming today."
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6", children: stats.map((stat, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[10px] shadow-sm border border-gray-50 flex justify-between items-start", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[14px] font-medium tracking-wider uppercase text-[#575E6B]", children: stat.label }),
        /* @__PURE__ */ jsx("p", { className: "font-['Oswald'] text-3xl font-bold text-[#16181D] mt-2", children: stat.value }),
        /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-[#575E6B] mt-2", children: stat.subtext })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-full ${stat.color} flex items-center justify-center`, children: /* @__PURE__ */ jsx("img", { src: stat.icon, className: `w-6 h-6 ${stat.iconColor}`, alt: stat.label }) })
    ] }, idx)) }),
    /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#9ECAD6] rounded-xl p-6 flex items-center gap-6 text-white cursor-pointer hover:opacity-95 transition-opacity", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", className: "w-8 h-8", alt: "Search" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-xl font-bold text-white normal-case tracking-normal", children: "Finding package" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/80", children: "Enter package ID to get package information" })
        ] }),
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", className: "w-6 h-6 opacity-50", alt: "Arrow" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#748DAE] rounded-xl p-6 flex items-center gap-6 text-white cursor-pointer hover:opacity-95 transition-opacity", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", className: "w-8 h-8", alt: "Track" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-xl font-bold text-white normal-case tracking-normal", children: "Track Shipment" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/80", children: "Enter a tracking ID to get real-time updates." })
        ] }),
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", className: "w-6 h-6 opacity-50", alt: "Arrow" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold text-[#16181D] normal-case tracking-normal", children: "Incoming Package" }),
        /* @__PURE__ */ jsx("button", { className: "px-6 py-2 border border-[#748DAE]/30 rounded-lg text-[#748DAE] font-bold text-sm hover:bg-gray-50 transition-colors", children: "View All" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[10px] shadow-sm border border-gray-50 overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[800px]", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-bold text-[#16181D]", children: "Tracking ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-bold text-[#16181D]", children: "Recipient" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-bold text-[#16181D]", children: "Destination" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-bold text-[#16181D]", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-right text-sm font-bold text-[#16181D]", children: "Est. Delivery" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-[#565d6d] font-['Oswald']", children: "87 \u20AB" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-50", children: tableData.map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-[#748DAE]", children: row.id }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-[#16181D]", children: row.recipient }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-[#575E6B]", children: row.destination }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[12px] font-bold ${row.statusColor}`, children: row.status }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-[#16181D] text-right", children: row.date }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4" })
        ] }, idx)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold text-[#16181D] normal-case tracking-normal mb-6", children: "Report" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-44 mb-6", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", className: "w-full h-full object-contain", alt: "Chart" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
              /* @__PURE__ */ jsx("span", { children: "16" }),
              /* @__PURE__ */ jsx("span", { children: "12" }),
              /* @__PURE__ */ jsx("span", { children: "8" }),
              /* @__PURE__ */ jsx("span", { children: "4" }),
              /* @__PURE__ */ jsx("span", { children: "0" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[-20px] left-0 right-0 flex justify-around text-[11px] text-[#16181D]", children: [
              /* @__PURE__ */ jsx("span", { children: "Jun" }),
              /* @__PURE__ */ jsx("span", { children: "Jul" }),
              /* @__PURE__ */ jsx("span", { children: "Aug" }),
              /* @__PURE__ */ jsx("span", { children: "Sep" }),
              /* @__PURE__ */ jsx("span", { children: "Oct" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-8", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-5 h-5 text-[#2C5B68]", alt: "Trend" }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-[#2C5B68] tracking-tight", children: "Monthly Incoming Shipment" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-44 mb-6", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", className: "w-full h-full object-contain", alt: "Chart" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
              /* @__PURE__ */ jsx("span", { children: "16" }),
              /* @__PURE__ */ jsx("span", { children: "12" }),
              /* @__PURE__ */ jsx("span", { children: "8" }),
              /* @__PURE__ */ jsx("span", { children: "4" }),
              /* @__PURE__ */ jsx("span", { children: "0" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[-20px] left-0 right-0 flex justify-around text-[11px] text-[#16181D]", children: [
              /* @__PURE__ */ jsx("span", { children: "Jun" }),
              /* @__PURE__ */ jsx("span", { children: "Jul" }),
              /* @__PURE__ */ jsx("span", { children: "Aug" }),
              /* @__PURE__ */ jsx("span", { children: "Sep" }),
              /* @__PURE__ */ jsx("span", { children: "Oct" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-8", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-5 h-5 text-[#2C5B68]", alt: "Trend" }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-[#2C5B68] tracking-tight", children: "Monthly Purchase request" })
          ] })
        ] })
      ] })
    ] })
  ] }) }) }) });
}
export {
  DomesticWarehouseSection as default
};
