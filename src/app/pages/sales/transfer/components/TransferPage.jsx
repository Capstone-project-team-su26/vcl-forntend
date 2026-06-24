"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as operationsService from "@/utils/operationsService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
function TransferPage() {
  const [transfer, setTransfer] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    operationsService.getTransferOptions().then(setTransfer);
  }, []);
  async function handleConfirm() {
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await operationsService.confirmTransfer({
        recipientName: "Mock Recipient",
        city: "Ho Chi Minh City"
      });
      setMessage(`${response.message} Tracking: ${response.trackingId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  const summary = transfer?.summary;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx(Link, { href: ROUTES.sales.home, className: "inline-flex items-center text-sm font-medium text-muted hover:text-primary transition-colors", children: "\u2190 V\u1EC1 t\u1ED5ng quan" }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-black tracking-tight mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-ink", children: "Transfer " }),
          /* @__PURE__ */ jsx("span", { className: "text-primary font-sans normal-case", children: "Package" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted mb-10", children: "Fill in the details below to generate your shipping label and schedule a pickup." }),
        error ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
        message ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: message }) : null,
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-8 space-y-12", children: [
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "step-number", children: "1" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink normal-case tracking-normal", children: "Package type" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                /* @__PURE__ */ jsx(PackageCard, { icon: "/assets/IMG_15.svg", label: "Envelope", sub: "Up to 0.5kg" }),
                /* @__PURE__ */ jsx(PackageCard, { icon: "/assets/IMG_16.svg", label: "Small Box", sub: "Up to 5kg", active: true }),
                /* @__PURE__ */ jsx(PackageCard, { icon: "/assets/IMG_17.svg", label: "Large Box", sub: "Up to 20kg" }),
                /* @__PURE__ */ jsx(PackageCard, { icon: "/assets/IMG_18.svg", label: "Pallet", sub: "Over 50kg" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "border-surface-muted" }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "step-number", children: "2" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink normal-case tracking-normal", children: "Destination Information" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white border border-surface-muted rounded-xl p-6 space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                  /* @__PURE__ */ jsx(InputField, { label: "Sender Full Name", placeholder: "Alex Henderson" }),
                  /* @__PURE__ */ jsx(InputField, { label: "Contact Number", placeholder: "+1 (555) 000-0000" })
                ] }),
                /* @__PURE__ */ jsx(
                  InputField,
                  {
                    label: "Delivery Street Address",
                    placeholder: "123 Logistics Way, Unit 4B",
                    icon: "/assets/IMG_19.svg"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
                  /* @__PURE__ */ jsx(InputField, { label: "City", placeholder: "San Francisco" }),
                  /* @__PURE__ */ jsx(InputField, { label: "State / Province", placeholder: "California" }),
                  /* @__PURE__ */ jsx(InputField, { label: "Zip Code", placeholder: "94103" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "border-surface-muted" }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "step-number", children: "3" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink normal-case tracking-normal", children: "Transfer service" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx(
                  ServiceOption,
                  {
                    title: "Economy Ground",
                    desc: "Affordable shipping for non-urgent deliveries.",
                    price: "$12.50",
                    est: "Est. 5-7 Business Days"
                  }
                ),
                /* @__PURE__ */ jsx(
                  ServiceOption,
                  {
                    title: "Standard Air",
                    desc: "Reliable transit with full tracking capabilities.",
                    price: "$24.80",
                    est: "Est. 2-3 Business Days",
                    active: true
                  }
                ),
                /* @__PURE__ */ jsx(
                  ServiceOption,
                  {
                    title: "Priority Express",
                    desc: "Next-day delivery with premium handling.",
                    price: "$48.20",
                    est: "Est. Next Day by 10 AM",
                    badge: "FASTEST"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("section", { className: "bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm", children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_21.svg", alt: "Shield", className: "w-6 h-6 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-ink normal-case tracking-normal mb-1", children: "Shipment Insurance" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mb-4", children: "Protect your package up to $500 for just $4.99. Recommended for fragile or high-value items." }),
                /* @__PURE__ */ jsx("button", { className: "px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors", children: "Add Protection" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-4 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-accent-subtle/40 rounded-xl shadow-lg shadow-black/5 overflow-hidden border border-white/60", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-white/60 p-6 border-b border-surface-muted", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-1", children: [
                  /* @__PURE__ */ jsx("img", { src: "/assets/IMG_11.svg", alt: "Card", className: "w-5 h-5 mr-2 text-secondary" }),
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-ink normal-case tracking-tight", children: "Shipment Summary" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted", children: "Estimated totals based on selection" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
                /* @__PURE__ */ jsx(SummaryRow, { label: "Package Type:", value: summary?.packageType || "small box" }),
                /* @__PURE__ */ jsx(SummaryRow, { label: "Service Level:", value: summary?.serviceLevel || "standard", valueClass: "text-secondary" }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted", children: "Est. Delivery:" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center font-semibold text-ink", children: [
                    /* @__PURE__ */ jsx("img", { src: "/assets/IMG_12.svg", alt: "Calendar", className: "w-3 h-3 mr-1.5" }),
                    summary?.estDelivery || "Oct 24, 2024"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("hr", { className: "border-surface-muted my-2" }),
                /* @__PURE__ */ jsx(SummaryRow, { label: "Base Rate", value: `$${summary?.baseRate?.toFixed(2) || "24.80"}` }),
                /* @__PURE__ */ jsx(SummaryRow, { label: "Fuel Surcharge", value: `$${summary?.fuelSurcharge?.toFixed(2) || "2.40"}` }),
                /* @__PURE__ */ jsx(SummaryRow, { label: "Handling Fee", value: `$${summary?.handlingFee?.toFixed(2) || "0.00"}` }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-secondary", children: "Total Due" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold font-[Oswald] text-secondary", children: [
                    "$",
                    summary?.total?.toFixed(2) || "27.20"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-accent/30 border border-accent/50 rounded-lg p-3 flex gap-3", children: [
                  /* @__PURE__ */ jsx("img", { src: "/assets/IMG_13.svg", alt: "Info", className: "w-4 h-4 mt-0.5 shrink-0 text-secondary" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-relaxed text-secondary/80", children: "Prices include basic tracking and up to $50 coverage. Terms and conditions apply." })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-6 bg-white/40", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  disabled: isSubmitting,
                  onClick: handleConfirm,
                  className: "w-full bg-primary text-white py-3.5 rounded-lg font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-60",
                  children: [
                    isSubmitting ? "Processing..." : "Confirm & Pay",
                    /* @__PURE__ */ jsx("img", { src: "/assets/IMG_14.svg", alt: "Arrow", className: "w-5 h-5" })
                  ]
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border border-dashed border-secondary/40 rounded-xl p-4 flex items-center gap-4 bg-transparent", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_20.svg", alt: "Truck", className: "w-5 h-5 text-secondary" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink", children: "Need a pickup?" }),
                /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted", children: "Schedule a courier for $2.99 extra." })
              ] })
            ] })
          ] })
        ] })
  ] });
}
function PackageCard({ icon, label, sub, active = false }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all cursor-pointer ${active ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-surface-muted hover:border-gray-300"}`, children: [
    /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center mb-4 ${active ? "bg-primary" : "bg-surface-muted"}`, children: /* @__PURE__ */ jsx("img", { src: icon, alt: label, className: `w-6 h-6 ${active ? "text-white" : "text-muted"}` }) }),
    /* @__PURE__ */ jsx("span", { className: `text-sm font-bold mb-1 ${active ? "text-primary" : "text-ink"}`, children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-[12px] text-muted", children: sub })
  ] });
}
function InputField({ label, placeholder, icon }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
    /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-ink", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex items-center bg-white border border-border rounded-lg px-3 py-2.5 focus-within:border-primary transition-colors", children: [
      icon && /* @__PURE__ */ jsx("img", { src: icon, alt: "icon", className: "w-4 h-4 mr-2 text-secondary" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder,
          className: "w-full text-sm text-muted placeholder:text-muted/60 outline-none bg-transparent"
        }
      )
    ] })
  ] });
}
function ServiceOption({ title, desc, price, est, active = false, badge }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer ${active ? "bg-primary/5 border-primary" : "bg-white border-surface-muted hover:border-gray-300"}`, children: [
    /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${active ? "border-primary" : "border-muted/30"}`, children: active && /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-primary rounded-full" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-ink", children: title }),
        badge && /* @__PURE__ */ jsx("span", { className: "bg-accent text-secondary text-[10px] font-bold px-2 py-0.5 rounded-lg", children: badge })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted", children: desc })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-secondary mb-1", children: price }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted", children: est })
    ] })
  ] });
}
function SummaryRow({ label, value, valueClass = "text-ink" }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted", children: label }),
    /* @__PURE__ */ jsx("span", { className: `font-semibold ${valueClass}`, children: value })
  ] });
}
export {
  TransferPage as default
};
