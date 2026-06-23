"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import * as staffService from "@/utils/staffService";
function GlobalWarehouseSection() {
  const [data, setData] = useState({ stats: [], inboundShipments: [] });
  useEffect(() => {
    staffService.getGlobalWarehouseData().then(setData);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-2", children: "Global warehouse operations" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted text-base lg:text-lg font-medium mb-8", children: "Receive parcels, scan and match codes, measure weight and dimensions, classify goods, and handle unidentified parcels." })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: data.stats.map((stat) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between h-40", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsx("div", { className: `w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center`, children: /* @__PURE__ */ jsx("img", { src: stat.icon, alt: stat.label, className: `w-5 h-5 ${stat.iconColor}` }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "Trend", className: "w-3 h-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold", children: stat.trend })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted mb-1", children: stat.label }),
        /* @__PURE__ */ jsx("p", { className: "font-oswald text-2xl font-bold", children: stat.value })
      ] })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxs("section", { className: "bg-white rounded-xl shadow-sm border border-gray-50 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-oswald text-xl font-bold mb-1", children: "Inbound Shipments" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted", children: "Scan, match, and measure incoming international parcels" })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1 text-primary font-bold text-sm hover:underline", children: [
          "View All ",
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "Arrow", className: "w-4 h-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[600px]", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left border-b border-surface-muted", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-3 text-sm font-bold", children: "Parcel Code" }),
          /* @__PURE__ */ jsx("th", { className: "pb-3 text-sm font-bold", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "pb-3 text-sm font-bold", children: "Route" }),
          /* @__PURE__ */ jsx("th", { className: "pb-3 text-sm font-bold", children: "Classification" }),
          /* @__PURE__ */ jsx("th", { className: "pb-3 text-sm font-bold text-right", children: "ETA" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-surface-muted", children: data.inboundShipments.map((row) => /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-gray-50/50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "py-4 text-sm font-bold text-primary", children: row.id }),
          /* @__PURE__ */ jsx("td", { className: "py-4", children: /* @__PURE__ */ jsx(
            "span",
            {
              className: `inline-block px-3 py-1 rounded-lg text-[12px] font-semibold ${row.status === "Pending" ? "bg-surface-muted text-muted" : "border border-surface-muted text-ink"}`,
              children: row.status
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
            /* @__PURE__ */ jsx("span", { children: row.route[0] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "to", className: "w-3 h-3 opacity-30" }),
            /* @__PURE__ */ jsx("span", { children: row.route[1] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("img", { src: row.typeIcon, alt: row.type, className: "w-3 h-3 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold text-muted tracking-wider uppercase", children: row.type })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-4 text-sm font-bold text-right", children: row.eta })
        ] }, row.id)) })
      ] }) })
    ] })
  ] });
}
export {
  GlobalWarehouseSection as default
};
