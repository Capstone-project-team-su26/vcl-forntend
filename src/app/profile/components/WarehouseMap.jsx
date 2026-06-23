import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function WarehouseMap() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const rackData = [
    { id: "A-1", fill: "3/8", rows: [["3301", "", "", ""], ["8871", "9021", "", ""]] },
    { id: "A-2", fill: "2/8", rows: [["", "3301", "", ""], ["", "", "3301", ""]] },
    { id: "A-3", fill: "3/8", rows: [["", "4432", "", ""], ["1129", "", "1129", ""]] },
    { id: "A-4", fill: "4/8", rows: [["8871", "", "1129", ""], ["3301", "", "8871", ""]] },
    { id: "B-1", fill: "3/8", rows: [["", "3301", "", ""], ["", "1129", "", "9021"]] },
    { id: "B-2", fill: "4/8", rows: [["4432", "", "4432", ""], ["1129", "", "9021", ""]] },
    { id: "B-3", fill: "5/8", rows: [["9021", "", "9021", ""], ["", "3301", "4432", "3301"]] },
    { id: "B-4", fill: "2/8", rows: [["", "1129", "", ""], ["", "", "4432", ""]] },
    { id: "C-1", fill: "3/8", rows: [["4432", "", "", ""], ["", "4432", "4432", ""]] },
    { id: "C-2", fill: "3/8", rows: [["", "", "", "9021"], ["9021", "", "4432", ""]] },
    { id: "C-3", fill: "2/8", rows: [["", "", "", ""], ["", "1129", "3301", ""]] },
    { id: "C-4", fill: "3/8", rows: [["", "", "", ""], ["1129", "1129", "8871", ""]] },
    { id: "D-1", fill: "5/8", rows: [["3301", "", "9021", ""], ["1129", "", "1129", "8871"]] },
    { id: "D-2", fill: "2/8", rows: [["", "", "1129", "9021"], ["", "", "", ""]] },
    { id: "D-3", fill: "4/8", rows: [["4432", "4432", "", ""], ["9021", "", "", "1129"]] },
    { id: "D-4", fill: "4/8", rows: [["8871", "", "8871", ""], ["", "4432", "", "3301"]] }
  ];
  const getCellColor = (val) => {
    if (val === "9021") return "bg-[#FFAA00]/20 border-[#dee1e6]";
    if (val === "8871") return 'bg-white border-[#dee1e6] relative after:content-[""] after:absolute after:bottom-1 after:left-1 after:right-1 after:h-1 after:bg-[#D92644]';
    if (val === "4432") return 'bg-white border-[#dee1e6] relative after:content-[""] after:absolute after:bottom-1 after:left-1 after:right-1 after:h-1 after:bg-[#FFAA00]';
    if (val !== "") return "bg-white border-[#dee1e6]";
    return "bg-[#f3f4f6]/10 border-[#dee1e6]";
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-[#171a1f]", children: [
    /* @__PURE__ */ jsxs("aside", { className: `fixed inset-y-0 left-0 z-50 w-64 bg-[#fafafb] border-r border-[#dee1e6] transition-transform lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center h-20 px-6 border-b border-[#dee1e6]", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-[#9ecad6] rounded-md flex items-center justify-center mr-3", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "NexusLogistics", className: "w-5.5 h-5.5" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-['Oswald'] text-xl font-bold text-[#9ecad6]", children: "NexusLogistics" })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "p-4 space-y-8 overflow-y-auto h-[calc(100vh-160px)]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "px-4 mb-4 text-[10px] font-bold text-[#565d6d] uppercase tracking-wider", children: "Main" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 bg-[#b3d6e0] text-[#19191F] font-semibold rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:layout-grid", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Floor Overview" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:package", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Package Search" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:truck", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Inbound Shipments" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:arrow-up-right", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Outbound Manifest" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "px-4 mb-4 text-[10px] font-bold text-[#565d6d] uppercase tracking-wider", children: "Analytics" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:layers", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Zone Capacity" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:ellipsis-vertical", className: "w-5 h-5 mr-3" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Performance" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 w-full p-4 border-t border-[#dee1e6]/50 bg-[#fafafb]", children: [
        /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:settings", className: "w-5 h-5 mr-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "System Settings" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:circle-help", className: "w-5 h-5 mr-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Documentation" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 flex items-center justify-between px-6 border-b border-[#dee1e6] bg-white/80 backdrop-blur-sm sticky top-0 z-40", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-1 gap-4", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "lg:hidden p-2 text-[#565d6d]", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { className: "relative max-w-md w-full", children: [
            /* @__PURE__ */ jsx(Icon, { icon: "lucide:search", className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565d6d]" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search by Package ID, SKU, or Client...",
                className: "w-full pl-10 pr-4 py-2 bg-[#f3f4f6]/20 border border-[#f3f4f6] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9ecad6]"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-px bg-[#dee1e6] mx-2 hidden md:block" }),
          /* @__PURE__ */ jsxs("button", { className: "hidden md:flex items-center px-3 py-1.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", alt: "filter", className: "w-4 h-4 mr-2" }),
            "Advanced Filters"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx("span", { className: "hidden lg:block text-xs font-medium", children: "Warehouse Alpha: Active" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Icon, { icon: "lucide:bell", className: "w-5 h-5 text-[#171a1f]" }),
            /* @__PURE__ */ jsx("span", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full overflow-hidden border border-[#dee1e6]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.webp", alt: "User", className: "w-full h-full object-cover" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col lg:flex-row overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto bg-[#fafafb]/30 p-6 lg:p-10 custom-scrollbar", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight mb-2", children: "Zone 4 Storage Grid" }),
              /* @__PURE__ */ jsx("p", { className: "text-[#565d6d]", children: "Real-time shelf allocation for Rack Groups A through D." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex bg-white p-1 rounded-md border border-[#dee1e6] shadow-sm self-start md:self-auto", children: [
              /* @__PURE__ */ jsxs("button", { className: "flex items-center px-4 py-1.5 bg-[#f3f4f6] rounded-md text-sm font-medium", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:layout-grid", className: "w-4 h-4 mr-2" }),
                "Grid View"
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "flex items-center px-4 py-1.5 text-[#565d6d] text-sm font-medium hover:bg-gray-50", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-4 h-4 mr-2" }),
                "List View"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6", children: rackData.map((rack) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-[#dee1e6] shadow-sm overflow-hidden flex flex-col", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 bg-[#fafafb] border-b border-[#dee1e6]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:map-pin", className: "w-3 h-3 text-[#FFAA00] mr-2" }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold", children: [
                  "Rack ",
                  rack.id
                ] })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 border border-[#f3f4f6] rounded-full text-[10px] font-semibold", children: [
                rack.fill,
                " Fill"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-3 flex-1", children: /* @__PURE__ */ jsxs("div", { className: "border border-[#dee1e6] rounded overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[32px_1fr]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-12 flex items-center justify-center bg-[#f3f4f6]/30 border-b border-r border-[#dee1e6] text-[10px] font-bold", children: "A" }),
                  /* @__PURE__ */ jsx("div", { className: "h-12 flex items-center justify-center bg-[#f3f4f6]/30 border-r border-[#dee1e6] text-[10px] font-bold", children: "B" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-rows-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 h-12", children: rack.rows[0].map((cell, i) => /* @__PURE__ */ jsx("div", { className: `border-b border-r last:border-r-0 flex items-center justify-center text-[10px] font-bold ${getCellColor(cell)}`, children: cell || /* @__PURE__ */ jsx("span", { className: "text-[#565d6d]/30", children: "\u2014" }) }, i)) }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 h-12", children: rack.rows[1].map((cell, i) => /* @__PURE__ */ jsx("div", { className: `border-r last:border-r-0 flex items-center justify-center text-[10px] font-bold ${getCellColor(cell)}`, children: cell || /* @__PURE__ */ jsx("span", { className: "text-[#565d6d]/30", children: "\u2014" }) }, i)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[32px_1fr] bg-[#f3f4f6]/30 border-t border-[#dee1e6]", children: [
                /* @__PURE__ */ jsx("div", {}),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 py-1", children: [1, 2, 3, 4].map((n) => /* @__PURE__ */ jsx("span", { className: "text-center text-[8px] font-bold text-[#565d6d]", children: n }, n)) })
              ] })
            ] }) })
          ] }, rack.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-4 border-t border-[#dee1e6] flex flex-wrap items-center gap-x-8 gap-y-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold text-[#565d6d] uppercase", children: "Live Legend:" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-white border border-[#dee1e6] rounded-sm" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "In Stock" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-[#FFAA00] rounded-sm" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Allocated" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-[#f3f4f6]/10 border border-[#dee1e6] rounded-sm" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Pending" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-[#D92644] rounded-sm" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Flagged/Audit" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs italic text-[#565d6d]", children: "Last Sync: 12:44:01 PM GMT" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "w-full lg:w-96 bg-[#fafafb] border-l border-[#dee1e6] flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white border-b border-[#dee1e6]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "PKG-9021" }),
              /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-[#f3f4f6] rounded-full text-[10px] font-bold", children: "In Stock" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#565d6d] mb-6", children: "SKU-772-B" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-[#f3f4f6]/40 rounded", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-[#565d6d] uppercase mb-1", children: "Weight" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "2.4kg" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-[#f3f4f6]/40 rounded", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-[#565d6d] uppercase mb-1", children: "Dimensions" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "12x12x8" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar", children: [
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:package", className: "w-3 h-3 text-[#565d6d]" }),
                /* @__PURE__ */ jsx("h3", { className: "text-[12px] font-bold text-[#565d6d] uppercase", children: "Product Description" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Precision Calibrator" })
            ] }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:layers", className: "w-3 h-3 text-[#565d6d]" }),
                /* @__PURE__ */ jsx("h3", { className: "text-[12px] font-bold text-[#565d6d] uppercase", children: "Movement History" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-[#dee1e6]/50", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(Icon, { icon: "lucide:calendar", className: "w-3.5 h-3.5 text-[#565d6d]" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-[#565d6d]", children: "Arrival" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "2023-11-20" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-[#dee1e6]/50", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(Icon, { icon: "lucide:barcode", className: "w-3.5 h-3.5 text-[#565d6d]" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-[#565d6d]", children: "Last Scan" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "2 hrs ago" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-[#dee1e6]/50", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(Icon, { icon: "lucide:truck", className: "w-3.5 h-3.5 text-[#565d6d]" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-[#565d6d]", children: "Courier" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Express Logistics" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:user", className: "w-3 h-3 text-[#565d6d]" }),
                /* @__PURE__ */ jsx("h3", { className: "text-[12px] font-bold text-[#565d6d] uppercase", children: "Assigned Handler" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center p-3 bg-white border border-[#dee1e6] rounded-md", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full overflow-hidden mr-3", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.webp", alt: "Alex Rivera", className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "Alex Rivera" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#565d6d]", children: "Floor Supervisor \u2022 Zone B" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white border-t border-[#dee1e6] space-y-3", children: [
            /* @__PURE__ */ jsxs("button", { className: "w-full h-11 flex items-center justify-between px-6 bg-[#748dae] text-[#19191F] font-medium rounded-md hover:bg-[#637a99] transition-colors", children: [
              "Add to shipment",
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:arrow-up-right", className: "w-4 h-4" })
            ] }),
            /* @__PURE__ */ jsx("button", { className: "w-full h-10 border border-[#dee1e6] text-[#171a1f] font-medium rounded-md hover:bg-gray-50 transition-colors", children: "Edit Metadata" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  WarehouseMap as default
};
