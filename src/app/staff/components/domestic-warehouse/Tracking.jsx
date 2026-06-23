import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
function Tracking() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-[#16181D]", children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto custom-scrollbar", children: [
    /* @__PURE__ */ jsx("section", { className: "bg-[#F4F9FA] px-4 py-12 lg:px-36 border-b border-[#f3f4f6]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black text-[#16181D]", children: "Track Your Shipment" }),
        /* @__PURE__ */ jsx("span", { className: "px-3 py-0.5 border border-[#748DAE] bg-[#FFEAEA]/50 rounded-full text-[12px] font-semibold text-[#748DAE]", children: "Global Logistics" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[#575E6B] font-medium mb-8", children: "Enter your tracking number below for real-time updates and delivery management." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-lg search-focus border-2 border-[#9ECAD6] rounded-lg bg-white px-4 flex items-center", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", alt: "Search", className: "w-5 h-5 mr-3" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              defaultValue: "SS-9421-BK88",
              className: "w-full py-3.5 text-sm font-bold outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("button", { className: "bg-[#748DAE] text-white px-8 py-3.5 rounded-lg font-bold text-lg shadow-md hover:bg-[#637a96] transition-all shrink-0", children: "Track Package" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm border-2 border-[#9ECAD6]/30 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#FFEAEA] p-4 flex items-center justify-between border-b border-[#f3f4f6]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", alt: "Truck", className: "w-6 h-6" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold uppercase tracking-widest text-[#748DAE]", children: "Current Status" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-[#16181D]", children: "Out for Delivery" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold uppercase tracking-widest text-[#575E6B]", children: "Expected Arrival" }),
              /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-[#748DAE]", children: "Today, 4:45 PM" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 grid grid-cols-2 md:grid-cols-4 gap-6", children: [
            /* @__PURE__ */ jsx(StatusDetail, { label: "Shipper", value: "TechVanguard Solutions" }),
            /* @__PURE__ */ jsx(StatusDetail, { label: "Service Type", value: "Priority Express" }),
            /* @__PURE__ */ jsx(StatusDetail, { label: "Weight", value: "2.4 kg / 5.2 lbs" }),
            /* @__PURE__ */ jsx(StatusDetail, { label: "Destination", value: "London, UK" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black", children: "Shipping History" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-[#575E6B]", children: "(GMT +0)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-0 relative", children: [
            /* @__PURE__ */ jsx(
              TimelineItem,
              {
                icon: "./assets/IMG_15.svg",
                title: "Out for Delivery",
                location: "London - North Distribution Hub, UK",
                time: "Nov 18, 2024 - 08:30 AM",
                active: true
              }
            ),
            /* @__PURE__ */ jsx(
              TimelineItem,
              {
                icon: "./assets/IMG_16.svg",
                title: "Arrived at Facility",
                location: "London Heathrow International (LHR), UK",
                time: "Nov 17, 2024 - 11:15 PM",
                completed: true
              }
            ),
            /* @__PURE__ */ jsx(
              TimelineItem,
              {
                icon: "./assets/IMG_16.svg",
                title: "Departed Origin Facility",
                location: "New York Gateway (JFK), USA",
                time: "Nov 16, 2024 - 02:45 PM",
                completed: true
              }
            ),
            /* @__PURE__ */ jsx(
              TimelineItem,
              {
                icon: "./assets/IMG_16.svg",
                title: "Processed at Sorting Center",
                location: "Brooklyn Logistics Center, NY",
                time: "Nov 16, 2024 - 09:12 AM",
                completed: true
              }
            ),
            /* @__PURE__ */ jsx(
              TimelineItem,
              {
                icon: "./assets/IMG_16.svg",
                title: "Shipment Information Received",
                location: "Electronic Submission",
                time: "Nov 15, 2024 - 04:30 PM",
                completed: true,
                isLast: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-between p-5 border-2 border-[#9ECAD6] rounded-lg bg-white hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "Calendar", className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Reschedule Delivery" })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "Arrow", className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-between p-5 border-2 border-[#F5CBCB] rounded-lg bg-white hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.svg", alt: "Pin", className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Hold at Location" })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "Arrow", className: "w-4 h-4" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#748DAE] rounded-xl p-6 text-white shadow-lg", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-1", children: "Delivery Management" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/70 text-sm mb-6", children: "Secure your package before it arrives." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("button", { className: "w-full bg-[#9ECAD6] hover:bg-[#8dbbc8] py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", alt: "Shield", className: "w-4 h-4" }),
              "Add Insurance +$4.99"
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "w-full bg-transparent hover:bg-white/10 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", alt: "Phone", className: "w-4 h-4" }),
              "Contact Courier"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border-2 border-[#f3f4f6] shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Incoming (4)" }),
            /* @__PURE__ */ jsx("button", { className: "p-1 hover:bg-gray-100 rounded", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "More", className: "w-4 h-4" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "px-6 pb-4 space-y-3", children: [
            /* @__PURE__ */ jsx(
              IncomingItem,
              {
                id: "SS-9421-BK88",
                shipper: "TechVanguard Solutions",
                status: "Out for Delivery",
                active: true
              }
            ),
            /* @__PURE__ */ jsx(
              IncomingItem,
              {
                id: "SS-1290-LP12",
                shipper: "Amazon Marketplace",
                status: "In Transit - Bristol Hub"
              }
            ),
            /* @__PURE__ */ jsx(
              IncomingItem,
              {
                id: "SS-7734-XQ91",
                shipper: "Nike Official Store",
                status: "Pending Pickup"
              }
            ),
            /* @__PURE__ */ jsx(
              IncomingItem,
              {
                id: "SS-0023-HH45",
                shipper: "John Doe (Personal)",
                status: "Label Created"
              }
            ),
            /* @__PURE__ */ jsx("button", { className: "w-full py-3 text-[12px] font-bold text-[#748DAE] hover:underline", children: "View Archived Shipments" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F9FAFB] rounded-xl p-6 border-2 border-dashed border-[#f3f4f6] flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#FFEAEA] rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_20.svg", alt: "Alert", className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm mb-1", children: "Need Help?" }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B] leading-relaxed mb-3", children: "Our 24/7 support is here for any shipping issues." }),
            /* @__PURE__ */ jsx("button", { className: "text-[12px] font-bold text-[#748DAE] hover:underline", children: "Start Live Chat" })
          ] })
        ] })
      ] })
    ] })
  ] }) }) });
}
function NavItem({ icon, label, active = false }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${active ? "bg-[#9ECAD6]/10 text-[#9ECAD6]" : "text-[#575E6B] hover:bg-gray-100"}`,
      children: [
        active && /* @__PURE__ */ jsx("div", { className: "nav-active-indicator" }),
        /* @__PURE__ */ jsx("img", { src: icon, alt: label, className: `w-5 h-5 ${active ? "opacity-100" : "opacity-70"}` }),
        label
      ]
    }
  );
}
function StatusDetail({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold uppercase text-[#575E6B] mb-1", children: label }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#16181D] leading-tight", children: value })
  ] });
}
function TimelineItem({
  icon,
  title,
  location,
  time,
  active = false,
  completed = false,
  isLast = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: "timeline-item flex gap-6 pb-8 relative", children: [
    !isLast && /* @__PURE__ */ jsx("div", { className: `timeline-line ${completed ? "bg-[#9ECAD6]" : "bg-[#f3f4f6]"}` }),
    /* @__PURE__ */ jsx("div", { className: `relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-[#748DAE]" : completed ? "bg-[#9ECAD6]" : "bg-gray-200"}`, children: /* @__PURE__ */ jsx("img", { src: icon, alt: "Status", className: "w-5 h-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "pt-1", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-[Oswald] text-base font-bold text-[#16181D] leading-none mb-1", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#575E6B] mb-1", children: location }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B]/60", children: time })
    ] })
  ] });
}
function IncomingItem({
  id,
  shipper,
  status,
  active = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-lg border transition-all ${active ? "bg-[#FFEAEA] border-[#748DAE] shadow-sm" : "bg-white border-[#f3f4f6] hover:border-gray-300"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "Package", className: `w-4 h-4 ${active ? "text-[#748DAE]" : "text-[#575E6B]"}` }),
        /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold tracking-wider", children: id })
      ] }),
      active && /* @__PURE__ */ jsx("span", { className: "bg-[#748DAE] text-white text-[10px] font-bold px-2 py-0.5 rounded-full", children: "Active" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#16181D] mb-1", children: shipper }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B]", children: status })
  ] });
}
export {
  Tracking as default
};
