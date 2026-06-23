"use client";

import { createConsignmentOrder } from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
function TransferService() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shippingOption, setShippingOption] = useState("Express");
  const [note, setNote] = useState("");
  const [itemDetails, setItemDetails] = useState({
    productName: "",
    productType: "",
    quantity: 1,
    weight: 0,
    width: 0,
    height: 0,
    length: 0,
    declaredValue: 0,
    referenceUrl: "",
    domesticTrackingCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const tierPrices = {
    Standard: 12.5,
    Express: 24.9,
    Consolidation: 85
  };
  const handleItemChange = (field, value) => {
    setItemDetails((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const payload = {
      shippingOption,
      note,
      items: [
        {
          productName: itemDetails.productName,
          productType: itemDetails.productType,
          quantity: Number(itemDetails.quantity) || 0,
          weight: Number(itemDetails.weight) || 0,
          width: Number(itemDetails.width) || 0,
          height: Number(itemDetails.height) || 0,
          length: Number(itemDetails.length) || 0,
          declaredValue: Number(itemDetails.declaredValue) || 0,
          referenceUrl: itemDetails.referenceUrl,
          domesticTrackingCode: itemDetails.domesticTrackingCode,
        },
      ],
    };

    try {
      await createConsignmentOrder(payload);
      setStatus({ type: "success", message: "Consignment order successfully created!" });
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error, "Failed to submit order. Please check your connection and try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto bg-white", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-6xl mx-auto px-4 py-12 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl lg:text-5xl font-extrabold text-[#16181D] mb-6 tracking-tight", children: [
          "Transparent Pricing for ",
          /* @__PURE__ */ jsx("span", { className: "text-[#748DAE] font-sans", children: "Global Logistics" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-[#575E6B] max-w-2xl mx-auto", children: "Shipping options" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-16", children: [
        /* @__PURE__ */ jsx("div", { onClick: () => setShippingOption("Express"), className: "cursor-pointer", children: /* @__PURE__ */ jsx(
          PricingCard,
          {
            tier: "Express",
            price: "24.90",
            description: "Priority logistics with doorstep pickup and guaranteed timelines.",
            features: ["2-3 Business Days", "Real-time GPS Tracking", "Doorstep Pickup", "Premium Padding", "Insurance Coverage"],
            accentColor: "bg-[#748DAE]",
            isBestValue: true,
            highlighted: shippingOption === "Express"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { onClick: () => setShippingOption("Consolidation"), className: "cursor-pointer", children: /* @__PURE__ */ jsx(
          PricingCard,
          {
            tier: "Consolidation",
            price: "85.00",
            description: "Heavy-duty transit for bulky items, pallets, and large cargo.",
            features: ["7-10 Business Days", "Dedicated Support", "Palletization Included", "Custom Clearance Assist", "Lift-gate Service"],
            accentColor: "bg-[#F5CBCB]",
            highlighted: shippingOption === "Consolidation"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-center py-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-[#f3f4f6]" }),
          /* @__PURE__ */ jsx("span", { className: "flex-shrink mx-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[#575E6B]", children: "Customize your shipment" }),
          /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-[#f3f4f6]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#E5E7EB] p-6 lg:p-8 space-y-8 rounded-xl shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[#F3F4F6] pb-4", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-[#748DAE]", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" }) }),
            /* @__PURE__ */ jsx("h2", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "Item Details" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Product Name *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: itemDetails.productName,
                  onChange: (e) => handleItemChange("productName", e.target.value),
                  placeholder: "e.g., Electronics, Apparel",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Product Type / Category" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: itemDetails.productType,
                  onChange: (e) => handleItemChange("productType", e.target.value),
                  placeholder: "e.g., Fragile, Liquid, Standard",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Quantity" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  value: itemDetails.quantity,
                  onChange: (e) => handleItemChange("quantity", parseInt(e.target.value) || 0),
                  placeholder: "1",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Weight (kg)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  value: itemDetails.weight || "",
                  onChange: (e) => handleItemChange("weight", parseFloat(e.target.value) || 0),
                  placeholder: "0.00",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Declared Value ($)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  value: itemDetails.declaredValue || "",
                  onChange: (e) => handleItemChange("declaredValue", parseFloat(e.target.value) || 0),
                  placeholder: "0.00",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Domestic Tracking Code" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: itemDetails.domesticTrackingCode,
                  onChange: (e) => handleItemChange("domesticTrackingCode", e.target.value),
                  placeholder: "Optional tracking code",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 md:col-span-2 lg:col-span-1 space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Dimensions (L x W x H cm)" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "L", value: itemDetails.length || "", onChange: (e) => handleItemChange("length", parseFloat(e.target.value) || 0), className: "h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" }),
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "W", value: itemDetails.width || "", onChange: (e) => handleItemChange("width", parseFloat(e.target.value) || 0), className: "h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" }),
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "H", value: itemDetails.height || "", onChange: (e) => handleItemChange("height", parseFloat(e.target.value) || 0), className: "h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 md:col-span-2 space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Product Reference URL(optional)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: itemDetails.referenceUrl,
                  onChange: (e) => handleItemChange("referenceUrl", e.target.value),
                  placeholder: "https://example.com/product-link",
                  className: "w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-4 border-t border-[#F3F4F6]", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-[#575E6B]", children: "Shipment Note / Special Instructions" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 3,
                value: note,
                onChange: (e) => setNote(e.target.value),
                placeholder: "Add any specific handling instructions or details regarding your shipment here...",
                className: "w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors resize-none"
              }
            )
          ] })
        ] }),
        status && /* @__PURE__ */ jsx("div", { className: `p-4 rounded-lg border font-medium ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`, children: status.message }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "Package", className: "w-6 h-6 text-[#9ECAD6]" }),
              /* @__PURE__ */ jsx("h2", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "Additional Services" })
            ] }),
            /* @__PURE__ */ jsx(ServiceItem, { icon: "./assets/IMG_15.svg", title: "Shipping Insurance", desc: "Protect against damage or loss up to $5,000 value.", price: "+ $5.00" }),
            /* @__PURE__ */ jsx(ServiceItem, { icon: "./assets/IMG_16.svg", title: "Eco-Friendly Delivery", desc: "100% carbon offset for your package's transit route.", price: "+ $1.50" }),
            /* @__PURE__ */ jsx(ServiceItem, { icon: "./assets/IMG_17.svg", title: "Fragile Handling", desc: "Specialized sorting and shock-absorbent mounting.", price: "+ $3.25" }),
            /* @__PURE__ */ jsx(ServiceItem, { icon: "./assets/IMG_18.svg", title: "Express Customs", desc: "Priority documentation processing for international routes.", price: "+ $12.00" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-4 space-y-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#FFEAEA]/40 border border-[#F5CBCB]/50 rounded-xl p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", alt: "Coupon", className: "w-5 h-5 text-[#F5CBCB]" }),
              /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-lg font-bold text-[#16181D]", children: "Have a Coupon?" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-8", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Enter code",
                  className: "flex-1 h-10 px-3 bg-white border border-[#F5CBCB]/30 rounded-lg text-sm outline-none",
                  disabled: true
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "button", className: "px-4 h-10 bg-[#748DAE] text-white font-bold text-sm rounded-lg hover:bg-[#5d7391] transition-colors opacity-50 cursor-not-allowed", children: "Apply" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-[#F5CBCB]/30 pt-6 mb-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { children: "Selected Tier" }),
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-[#16181D]", children: [
                  shippingOption,
                  " ($",
                  tierPrices[shippingOption]?.toFixed(2),
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { children: "Add-ons Total" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-[#16181D]", children: "$0.00" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-[#F5CBCB]/30 pt-6 text-center mb-6", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#16181D] mb-4 text-left", children: "Est. Base Price / kg" }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Oswald'] text-6xl font-black text-[#16181D] leading-none mb-2", children: [
                "$",
                tierPrices[shippingOption]?.toFixed(2)
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[20px] font-bold text-[#575E6B] tracking-tighter uppercase", children: "Tax Included" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: isLoading,
                className: "w-full h-14 bg-[#16181D] hover:bg-[#2c303a] text-white font-['Oswald'] text-lg font-bold tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  "Processing..."
                ] }) : "Book Shipment"
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F9FAFB] border border-[#f3f4f6] rounded-xl p-8 flex flex-col md:flex-row items-center gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-[#9ECAD6]/20 rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.svg", alt: "Clock", className: "w-8 h-8 text-[#9ECAD6]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center md:text-left", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-lg font-black mb-2", children: "Business Shipment" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm opacity-90 mb-6 leading-relaxed", children: "Up to 40% off for monthly shipping volumes exceeding 500kg." })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors", children: "Contact Sales" })
        ] })
      ] })
    ] }) }) }),
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/20 z-40 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    )
  ] });
}
function NavItem({ icon, label, active = false }) {
  return /* @__PURE__ */ jsxs("button", { type: "button", className: `flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${active ? "bg-[#9ECAD6]/10 text-[#9ECAD6]" : "text-[#575E6B] hover:bg-gray-100"}`, children: [
    /* @__PURE__ */ jsx("img", { src: icon, alt: label, className: `w-5 h-5 mr-3 ${active ? "text-[#9ECAD6]" : "text-[#575E6B]"}` }),
    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: label })
  ] });
}
function PricingCard({ tier, price, description, features, accentColor, isBestValue = false, highlighted = false }) {
  return /* @__PURE__ */ jsxs("div", { className: `relative flex flex-col bg-white rounded-xl p-8 transition-all duration-300 ${highlighted ? "border-2 border-[#748DAE] shadow-lg scale-105 z-10" : "border-2 border-[#f3f4f6] shadow-sm opacity-75"}`, children: [
    isBestValue && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-[#748DAE] text-white text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap", children: "BEST VALUE" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-sm font-bold text-[#575E6B] tracking-[1.4px] uppercase mb-4", children: tier }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "$" }),
        /* @__PURE__ */ jsx("span", { className: "font-['Oswald'] text-5xl font-extrabold text-[#16181D]", children: price }),
        /* @__PURE__ */ jsx("span", { className: "text-base font-medium text-[#575E6B]", children: "/ kg" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-[#575E6B] text-center mb-8 leading-relaxed", children: description }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-dashed border-[#f3f4f6] pt-6 space-y-4 flex-1", children: features.map((feature, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `w-[18px] h-[18px] ${accentColor} rounded-full flex items-center justify-center shrink-0`, children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", alt: "Check", className: "w-3.5 h-3.5" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#16181D]/90", children: feature })
    ] }, idx)) })
  ] });
}
function ServiceItem({ icon, title, desc, price }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center p-5 bg-[#f3f4f6]/20 border-2 border-[#f3f4f6] rounded-lg group hover:border-[#9ECAD6]/30 transition-colors", children: [
    /* @__PURE__ */ jsx("div", { className: "w-[50px] h-[50px] bg-white border border-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0 mr-4", children: /* @__PURE__ */ jsx("img", { src: icon, alt: title, className: "w-6 h-6 text-[#575E6B]" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-['Oswald'] text-base font-bold text-[#16181D]", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B]", children: desc })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-[#16181D]", children: price }),
      /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-[#575E6B]/30 rounded-full cursor-pointer hover:border-[#9ECAD6] transition-colors" })
    ] })
  ] });
}
export {
  TransferService as default
};
