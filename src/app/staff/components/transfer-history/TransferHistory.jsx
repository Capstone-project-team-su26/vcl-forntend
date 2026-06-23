import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function TransferHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const transfers = [
    { id: "SS-9402", status: "In Transit", route: "Mumbai \u2192 Dubai", type: "Express", eta: "24 Oct", typeIcon: "./assets/IMG_12.svg" },
    { id: "SS-8122", status: "Processing", route: "Chennai \u2192 Singapore", type: "Standard", eta: "26 Oct", typeIcon: "./assets/IMG_13.svg" },
    { id: "SS-7731", status: "Delivered", route: "London \u2192 Bengaluru", type: "Freight", eta: "21 Oct", typeIcon: "./assets/IMG_14.svg" },
    { id: "SS-6549", status: "Pending", route: "New York \u2192 New Delhi", type: "Express", eta: "28 Oct", typeIcon: "./assets/IMG_12.svg" },
    { id: "SS-5510", status: "Out for Delivery", route: "Kolkata \u2192 Paris", type: "Standard", eta: "Today", typeIcon: "./assets/IMG_13.svg" },
    { id: "SS-4290", status: "In Transit", route: "Tokyo \u2192 Mumbai", type: "Express", eta: "25 Oct", typeIcon: "./assets/IMG_12.svg" },
    { id: "SS-3108", status: "Delivered", route: "Sydney \u2192 Chennai", type: "Standard", eta: "18 Oct", typeIcon: "./assets/IMG_13.svg" }
  ];
  const getStatusStyles = (status) => {
    switch (status) {
      case "In Transit":
        return "bg-[#9ECAD6]/10 text-[#9ECAD6]";
      case "Delivered":
        return "bg-[#22C358]/10 text-[#22C358]";
      case "Processing":
      case "Pending":
      case "Out for Delivery":
        return "bg-[#F3F4F6] text-[#575E6B]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-[#F9FAFB]/50 font-['Open_Sans']", children: [
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40 bg-black/20 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsx("header", { className: "h-16 bg-white border-b border-[#F3F4F6] flex items-center justify-between px-4 lg:px-8 shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "lg:hidden p-2 text-[#575E6B]",
            onClick: () => setIsSidebarOpen(true),
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-[#16181D]", children: "Transfer History" })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-[#F3F4F6] p-4 flex flex-col lg:flex-row gap-4 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50", alt: "Search" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search by Tracking ID, Route...",
                className: "w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#9ECAD6]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 w-full lg:w-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-[13px] font-medium text-[#575E6B] whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", className: "w-4 h-4", alt: "Calendar" }),
              "Oct 01 - Oct 31, 2024"
            ] }),
            /* @__PURE__ */ jsx("button", { className: "flex-1 lg:flex-none px-6 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm font-bold text-[#16181D]", children: "Type" }),
            /* @__PURE__ */ jsx("button", { className: "flex-1 lg:flex-none px-6 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm font-bold text-[#16181D]", children: "Status" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-[#F3F4F6] overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse min-w-[800px]", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#F9FAFB] border-b border-[#F3F4F6]", children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider", children: "Tracking ID" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider", children: "Route" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider", children: "Type" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider text-right", children: "ETA" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#F3F4F6]", children: transfers.map((item, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50/50 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-[#9ECAD6]", children: item.id }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ${getStatusStyles(item.status)}`, children: item.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-[#16181D]", children: item.route }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("img", { src: item.typeIcon, className: "w-4 h-4", alt: item.type }),
                /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold text-[#575E6B] uppercase tracking-wider", children: item.type })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-[#16181D] text-right", children: item.eta }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("button", { className: "text-sm font-bold text-[#9ECAD6] hover:underline", children: "View Details" }) })
            ] }, idx)) })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[13px] text-[#575E6B]", children: "Showing 1 to 7 of 42 results" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("button", { className: "p-2 border border-[#575E6B]/50 rounded-md opacity-50 cursor-not-allowed", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", className: "w-4 h-4", alt: "Prev" }) }),
              /* @__PURE__ */ jsx("button", { className: "w-8 h-8 flex items-center justify-center bg-[#9ECAD6] text-white text-[13px] font-bold rounded-md", children: "1" }),
              /* @__PURE__ */ jsx("button", { className: "w-8 h-8 flex items-center justify-center text-[#575E6B] text-[13px] font-medium rounded-md hover:bg-gray-100", children: "2" }),
              /* @__PURE__ */ jsx("button", { className: "w-8 h-8 flex items-center justify-center text-[#575E6B] text-[13px] font-medium rounded-md hover:bg-gray-100", children: "3" }),
              /* @__PURE__ */ jsx("button", { className: "p-2 border border-[#575E6B] rounded-md hover:bg-gray-100", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", className: "w-4 h-4", alt: "Next" }) })
            ] })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  TransferHistory as default
};
