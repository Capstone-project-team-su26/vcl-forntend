"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function PricingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center min-w-fit", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "lg:hidden p-2 rounded-md hover:bg-gray-100 mr-3",
              onClick: () => setIsSidebarOpen(!isSidebarOpen),
              children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/logo.svg", alt: "Logo", className: "w-10 h-10" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 font-bold text-lg whitespace-nowrap", children: "NexusLogistics" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden lg:flex flex-1 justify-center gap-12", children: [
          /* @__PURE__ */ jsx("button", { className: "text-gray-700 hover:text-black", children: "Home" }),
          /* @__PURE__ */ jsx("button", { className: "text-gray-700 hover:text-black", children: "Tracking" }),
          /* @__PURE__ */ jsx("button", { className: "text-gray-700 hover:text-black", children: "Pricing" }),
          /* @__PURE__ */ jsx("button", { className: "text-gray-700 hover:text-black", children: "location" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center min-w-fit space-x-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "./assets/IMG_9.svg",
                alt: "Notifications",
                className: "w-5 h-5"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-[#f3f4f6]" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center text-right", children: [
            /* @__PURE__ */ jsxs("div", { className: "mr-3 hidden sm:block", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#16181D] leading-none", children: "Alex Henderson" }),
              /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B] mt-1", children: "Premium Member" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: "./assets/IMG_8.webp",
                  alt: "Avatar",
                  className: "w-9 h-9 rounded-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto bg-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-12 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-4xl lg:text-5xl font-extrabold text-[#16181D] mb-6 tracking-tight", children: [
              "Transparent Pricing for ",
              /* @__PURE__ */ jsx("span", { className: "text-[#748DAE] font-sans", children: "Global Logistics" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg text-[#575E6B] max-w-2xl mx-auto", children: "Choose the service level that fits your timeline and budget. No hidden fees, just pure efficiency." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-16", children: [
            /* @__PURE__ */ jsx(
              PricingCard,
              {
                tier: "Standard",
                price: "12.50",
                description: "Reliable shipping for non-urgent deliveries across all major cities.",
                features: ["5-7 Business Days", "Basic Tracking", "Drop-off at Point", "Standard Packaging"],
                accentColor: "bg-[#9ECAD6]"
              }
            ),
            /* @__PURE__ */ jsx(
              PricingCard,
              {
                tier: "Express",
                price: "24.90",
                description: "Priority logistics with doorstep pickup and guaranteed timelines.",
                features: ["2-3 Business Days", "Real-time GPS Tracking", "Doorstep Pickup", "Premium Padding", "Insurance Coverage"],
                accentColor: "bg-[#748DAE]",
                isBestValue: true,
                highlighted: true
              }
            ),
            /* @__PURE__ */ jsx(
              PricingCard,
              {
                tier: "Freight",
                price: "85.00",
                description: "Heavy-duty transit for bulky items, pallets, and large cargo.",
                features: ["7-10 Business Days", "Dedicated Support", "Palletization Included", "Custom Clearance Assist", "Lift-gate Service"],
                accentColor: "bg-[#F5CBCB]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-[200px]", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", alt: "Pin", className: "w-6 h-6 text-[#9ECAD6]" }),
                /* @__PURE__ */ jsx("h2", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "Package Type" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
                /* @__PURE__ */ jsx("select", { className: "w-full h-16 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-none appearance-none focus:outline-none text-[#9CA3AF]", children: /* @__PURE__ */ jsx("option", { children: "Package type" }) }),
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", alt: "Chevron", className: "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center py-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-[#f3f4f6]" }),
              /* @__PURE__ */ jsx("span", { className: "flex-shrink mx-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[#575E6B]", children: "Customize your shipment" }),
              /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-[#f3f4f6]" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "Package", className: "w-6 h-6 text-[#9ECAD6]" }),
                  /* @__PURE__ */ jsx("h2", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "Additional Services" })
                ] }),
                /* @__PURE__ */ jsx(
                  ServiceItem,
                  {
                    icon: "./assets/IMG_15.svg",
                    title: "Shipping Insurance",
                    desc: "Protect against damage or loss up to $5,000 value.",
                    price: "+ $5.00"
                  }
                ),
                /* @__PURE__ */ jsx(
                  ServiceItem,
                  {
                    icon: "./assets/IMG_16.svg",
                    title: "Eco-Friendly Delivery",
                    desc: "100% carbon offset for your package's transit route.",
                    price: "+ $1.50"
                  }
                ),
                /* @__PURE__ */ jsx(
                  ServiceItem,
                  {
                    icon: "./assets/IMG_17.svg",
                    title: "Fragile Handling",
                    desc: "Specialized sorting and shock-absorbent mounting.",
                    price: "+ $3.25"
                  }
                ),
                /* @__PURE__ */ jsx(
                  ServiceItem,
                  {
                    icon: "./assets/IMG_18.svg",
                    title: "Express Customs",
                    desc: "Priority documentation processing for international routes.",
                    price: "+ $12.00"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "pt-8", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", alt: "Pin", className: "w-6 h-6 text-[#9ECAD6]" }),
                    /* @__PURE__ */ jsx("h2", { className: "font-['Oswald'] text-2xl font-bold text-[#16181D]", children: "Shipping From" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "h-[106px] bg-[#F9FAFB] border border-[#E5E7EB] p-4", children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      placeholder: "Enter City or Country",
                      className: "w-full bg-transparent outline-none text-lg placeholder:text-[#9CA3AF]"
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-[#FFEAEA]/40 border border-[#F5CBCB]/50 rounded-xl p-8 shadow-sm", children: [
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
                        className: "flex-1 h-10 px-3 bg-white border border-[#F5CBCB]/30 rounded-lg text-sm outline-none"
                      }
                    ),
                    /* @__PURE__ */ jsx("button", { className: "px-4 h-10 bg-[#748DAE] text-white font-bold text-sm rounded-lg hover:bg-[#5d7391] transition-colors", children: "Apply" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-[#F5CBCB]/30 pt-6 mb-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                      /* @__PURE__ */ jsx("span", { children: "Selected Tier" }),
                      /* @__PURE__ */ jsx("span", { className: "font-bold text-[#16181D]", children: "Express ($24.90)" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                      /* @__PURE__ */ jsx("span", { children: "Add-ons Total" }),
                      /* @__PURE__ */ jsx("span", { className: "font-bold text-[#16181D]", children: "$0.00" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "border-t border-[#F5CBCB]/30 pt-6 text-center", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#16181D] mb-4 text-left", children: "Est. Total" }),
                    /* @__PURE__ */ jsx("p", { className: "font-['Oswald'] text-6xl font-black text-[#16181D] leading-none mb-2", children: "$24.90" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[20px] font-bold text-[#575E6B] tracking-tighter uppercase", children: "Tax Included" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-[#748DAE] rounded-xl p-6 text-white relative overflow-hidden", children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-lg font-black mb-2", children: "Business Shipment" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm opacity-90 mb-6 leading-relaxed", children: "Up to 40% off for monthly shipping volumes exceeding 500kg." }),
                    /* @__PURE__ */ jsx("button", { className: "px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors", children: "Contact Sales" })
                  ] }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "Globe", className: "absolute -bottom-4 -right-4 w-24 h-24 opacity-10" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-[#F9FAFB] border border-[#f3f4f6] rounded-xl p-8 flex flex-col md:flex-row items-center gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-[#9ECAD6]/20 rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.svg", alt: "Clock", className: "w-8 h-8 text-[#9ECAD6]" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center md:text-left", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-['Oswald'] text-xl font-bold text-[#16181D] mb-1", children: "Need it faster than Express?" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-[#575E6B]", children: "Our next day shiping service is available for critical medical or tech equipment." })
              ] }),
              /* @__PURE__ */ jsx("button", { className: "px-6 py-2.5 bg-white border-2 border-[#E0E2E6] rounded-lg font-bold text-sm text-[#16181D] hover:bg-gray-50 transition-colors whitespace-nowrap", children: "Inquire Emergency Shipping" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("footer", { className: "bg-[#f3f4f6]/30 border-t border-[#f3f4f6] py-4 px-8 flex flex-col md:flex-row justify-between items-center gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#575E6B]", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-[12px] text-[#575E6B]", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "hover:underline", children: "Support Center" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "hover:underline", children: "Terms of Service" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "hover:underline", children: "Privacy Policy" })
          ] })
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
function NavItem({ icon, label, active = false }) {
  return /* @__PURE__ */ jsxs("button", { className: `flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${active ? "bg-[#9ECAD6]/10 text-[#9ECAD6]" : "text-[#575E6B] hover:bg-gray-100"}`, children: [
    /* @__PURE__ */ jsx("img", { src: icon, alt: label, className: `w-5 h-5 mr-3 ${active ? "text-[#9ECAD6]" : "text-[#575E6B]"}` }),
    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: label })
  ] });
}
function PricingCard({ tier, price, description, features, accentColor, isBestValue = false, highlighted = false }) {
  return /* @__PURE__ */ jsxs("div", { className: `relative flex flex-col bg-white rounded-xl p-8 transition-all duration-300 ${highlighted ? "border-2 border-[#748DAE] shadow-lg scale-105 z-10" : "border-2 border-[#f3f4f6] shadow-sm"}`, children: [
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
  PricingPage as default
};
