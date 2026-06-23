"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import AppLogo from "@/app/components/AppLogo";
import UserNavMenu from "@/app/components/UserNavMenu";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import * as operationsService from "@/utils/operationsService";
function Homepage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [destination, setDestination] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(45);
  const [isEstimating, setIsEstimating] = useState(false);
  async function handleEstimate() {
    setIsEstimating(true);
    try {
      const result = await operationsService.estimatePrice({
        destination: destination || "Vietnam",
        packageType: "small-box"
      });
      setEstimatedPrice(result.estimatedPrice);
    } finally {
      setIsEstimating(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-surface-muted font-['Open_Sans'] text-ink-deep", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 w-full bg-white border-b border-border h-[72px] flex items-center", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-[152px] flex justify-between items-center", children: [
      /* @__PURE__ */ jsx(AppLogo, { variant: "header" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 md:gap-8", children: [
        /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center gap-8", children: [
          /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.svg", alt: "Track", className: "w-4 h-4" }),
            "Track & Receive"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => router.push("/pricing"),
              className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors",
              children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_3.svg", alt: "Pricing", className: "w-4 h-4" }),
                "Pricing & Services"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.svg", alt: "Contact", className: "w-4 h-4" }),
            "Contact"
          ] })
        ] }),
        isLoggedIn ? /* @__PURE__ */ jsx(UserNavMenu, { displayName: "SwiftShip User", roleLabel: "MEMBER" }) : /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => router.push("/login"),
            className: "h-10 px-5 bg-primary text-white text-[14px] font-bold rounded-lg hover:bg-primary-hover transition-colors",
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "md:hidden p-2", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-primary py-16 lg:py-0 lg:h-[565px] relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-[152px] h-full flex flex-col lg:flex-row items-center justify-between gap-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-[540px] z-10", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-[40px] md:text-[60px] leading-[1.1] font-[900] uppercase mb-6", children: [
          "Vietnam",
          /* @__PURE__ */ jsx("br", {}),
          "Cross-Border",
          /* @__PURE__ */ jsx("br", {}),
          "Logistics"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[18px] leading-[28px] font-medium text-black/80 mb-8 max-w-[454px]", children: "Reliable international and regional shipping from 14 to 30 days. Fast, secure, and fully tracked for your peace of mind." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => router.push("/purchaserequest"),
              className: "px-8 py-3 bg-black text-white text-[18px] font-bold hover:bg-gray-800 transition-colors",
              children: "Request Purchase"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => router.push("/purchaserequest"),
              className: "px-8 py-3 bg-black text-white text-[18px] font-bold hover:bg-gray-800 transition-colors",
              children: "Track Package"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[544px] bg-white shadow-[0px_25px_50px_0px_#00000040] p-8 z-20", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("h2", { className: "text-[20px] font-bold uppercase inline-block border-b-4 border-secondary pb-1", children: "Price Estimate" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[12px] font-bold text-subtle uppercase mb-2", children: "Destination" }),
            /* @__PURE__ */ jsx("div", { className: "bg-surface border border-border-muted p-3", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: destination,
                onChange: (e) => setDestination(e.target.value),
                onBlur: handleEstimate,
                placeholder: "Enter City or Country",
                className: "w-full bg-transparent outline-none text-[16px]"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[12px] font-bold text-subtle uppercase mb-2", children: "Package Type" }),
            /* @__PURE__ */ jsx("div", { className: "bg-surface border border-border-muted h-[50px]" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-surface-muted flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[14px] font-semibold", children: "Estimated Price:" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[24px] font-bold", children: [
              "$",
              estimatedPrice.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => router.push("/transfer"),
              className: "w-full py-3 bg-secondary text-white text-[14px] font-[900] uppercase hover:bg-secondary-hover transition-colors",
              children: isEstimating ? "Calculating..." : "Confirm Shipment"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "py-20 container mx-auto px-4 lg:px-[152px]", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[30px] font-[900] text-center uppercase mb-12", children: "Choose Your Package Type" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [
        { icon: "./assets/IMG_4.svg", title: "Envelope", desc: "Documents & Small Flat items", weight: "Up to 0.5kg" },
        { icon: "./assets/IMG_5.svg", title: "Small Box", desc: "Books, Electronics, Gifts", weight: "Up to 5kg" },
        { icon: "./assets/IMG_1.svg", title: "Large Box", desc: "Household items, Clothes", weight: "Up to 30kg" },
        { icon: "./assets/IMG_6.svg", title: "Pallet", desc: "Bulk commercial shipments", weight: "No Limit" }
      ].map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-8 shadow-[0px_1px_2.5px_0px_#171a1f12,_0px_0px_2px_0px_#171a1f14] hover:shadow-lg transition-shadow", children: [
        /* @__PURE__ */ jsx("img", { src: item.icon, alt: item.title, className: "w-12 h-12 mb-6 opacity-60" }),
        /* @__PURE__ */ jsx("h3", { className: "text-[20px] font-bold mb-2", children: item.title }),
        /* @__PURE__ */ jsx("p", { className: "text-[14px] text-subtle mb-6", children: item.desc }),
        /* @__PURE__ */ jsx("div", { className: "inline-block bg-accent px-2 py-1", children: /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold text-secondary", children: item.weight }) })
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "bg-accent-subtle border-y border-border-muted py-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-[152px] grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_7.svg", alt: "Express", className: "w-6 h-6 mt-1" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[16px] font-bold", children: "Express Delivery" }),
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-subtle", children: "Next day shipping available" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_8.svg", alt: "Insurance", className: "w-6 h-6 mt-1" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[16px] font-bold", children: "Full Insurance" }),
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-subtle", children: "Up to $5,000 coverage" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_9.svg", alt: "Fragile", className: "w-6 h-6 mt-1" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[16px] font-bold", children: "Fragile Handling" }),
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-subtle", children: "Specialized care for delicate items" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "bg-ink-deep text-white pt-16 pb-8", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-[152px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsx(AppLogo, { variant: "header", className: "mb-6" }),
          /* @__PURE__ */ jsx("p", { className: "text-faint text-[16px] leading-[24px] max-w-[353px]", children: "Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h5", { className: "text-[14px] font-bold uppercase mb-6", children: "Support" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-faint text-[14px]", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Help Center" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Tracking Guide" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Prohibited Items" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h5", { className: "text-[14px] font-bold uppercase mb-6", children: "Legal" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-faint text-[14px]", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Terms of Service" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Privacy Policy" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Cookie Policy" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[12px] text-subtle", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-[12px] text-subtle", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Facebook" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "LinkedIn" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Twitter" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Homepage as default
};
