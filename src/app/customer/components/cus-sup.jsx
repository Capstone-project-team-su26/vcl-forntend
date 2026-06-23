"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function CusSup() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen bg-white font-sans text-[#1E2124]", children: [
    /* @__PURE__ */ jsxs("header", { className: "fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#DEE0E3] z-50 flex items-center justify-between px-4 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "lg:hidden p-2 text-[#91969C]",
            onClick: () => setIsSidebarOpen(!isSidebarOpen),
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "relative max-w-[448px] w-full hidden sm:block", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-[#F4F5F6]/50 rounded-[10px] px-3 py-2 gap-2", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "search", className: "w-4 h-4 opacity-60" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search shipments, requests, or help...",
              className: "bg-transparent border-none outline-none text-sm w-full placeholder:text-[#91969C]"
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 lg:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_3.svg", alt: "notifications", className: "w-5 h-5 opacity-60 cursor-pointer" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EA1E1A] border-2 border-white rounded-full" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-8 w-[1px] bg-[#DEE0E3] hidden sm:block" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right hidden sm:block", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium leading-none", children: "Alex Johnson" }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#91969C] mt-1", children: "Premium Account" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full overflow-hidden border border-[#DEE0E3]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.jpeg", alt: "avatar", className: "w-full h-full object-cover" }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex pt-16 min-h-screen", children: [
      /* @__PURE__ */ jsx("aside", { className: `
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-[#68ADC0] rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_4.svg", alt: "logo", className: "w-5.5 h-5.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-[#68ADC0]", children: "SwiftShip" })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-4 space-y-2 mt-4", children: [
          /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#91969C] hover:bg-[#F4F5F6] transition-colors", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_5.svg", alt: "history", className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Purchase History" })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F4F5F6] text-[#68ADC0]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_6.svg", alt: "support", className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Support" })
            ] }),
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_7.svg", alt: "arrow", className: "w-4 h-4" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-[#DEE0E3] space-y-1", children: [
          /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#91969C] hover:bg-[#F4F5F6] transition-colors", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_8.svg", alt: "settings", className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Settings" })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#EA1E1A] hover:bg-red-50 transition-colors", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_9.svg", alt: "logout", className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Logout" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1184px] mx-auto p-6 lg:p-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight mb-2", children: "Customer Support" }),
          /* @__PURE__ */ jsx("p", { className: "text-[#91969C]", children: "Get the help you need, when you need it." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-8 space-y-12", children: [
            /* @__PURE__ */ jsxs("section", { className: "bg-[#F4F9FA] rounded-2xl border border-[#68ADC0]/10 p-8 lg:p-12 text-center relative overflow-hidden", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex items-center px-3 py-0.5 rounded-full bg-[#68ADC0]/5 border border-[#68ADC0]/30 text-[#68ADC0] text-[12px] font-semibold mb-6", children: "Support Center" }),
              /* @__PURE__ */ jsx("h2", { className: "text-3xl lg:text-4xl font-bold mb-4 tracking-tight", children: "How can we help you today?" }),
              /* @__PURE__ */ jsx("p", { className: "text-[#91969C] text-lg max-w-xl mx-auto mb-8", children: "Search our knowledge base for instant answers or reach out to our logistics experts." }),
              /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto relative mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-white border border-[#DEE0E3] rounded-xl px-4 py-4 shadow-sm focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all", children: [
                /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "search", className: "w-5 h-5 opacity-40 mr-3" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: "Search for tracking, billing, prohibited items...",
                    className: "w-full outline-none text-sm"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-[#91969C]", children: [
                /* @__PURE__ */ jsx("span", { children: "Popular:" }),
                /* @__PURE__ */ jsx("button", { className: "hover:text-[#68ADC0] transition-colors", children: "Tracking Guide" }),
                /* @__PURE__ */ jsx("button", { className: "hover:text-[#68ADC0] transition-colors", children: "Insurance Claims" }),
                /* @__PURE__ */ jsx("button", { className: "hover:text-[#68ADC0] transition-colors", children: "Pricing API" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold", children: "Frequently Asked Questions" }),
                /* @__PURE__ */ jsxs("button", { className: "text-[#68ADC0] text-sm font-medium flex items-center gap-1 hover:underline", children: [
                  "View All Knowledge Base ",
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_7.svg", alt: "arrow", className: "w-4 h-4" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#DEE0E3] rounded-xl overflow-hidden shadow-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "border-b border-[#DEE0E3]", children: [
                  /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium text-lg", children: "How do I track my international shipment?" }),
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "chevron", className: "w-4 h-4" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 text-[#91969C] text-sm leading-relaxed", children: "You can track any international shipment using your 12-digit Tracking ID on our global tracking page. Updates are provided in real-time as your package passes through customs checkpoints." })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "border-b border-[#DEE0E3]", children: /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-lg", children: "What are the requirements for shipping hazardous materials?" }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "chevron", className: "w-4 h-4" })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "border-b border-[#DEE0E3]", children: /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-lg", children: "How are shipping rates calculated?" }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "chevron", className: "w-4 h-4" })
                ] }) }),
                /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-lg", children: "What is the procedure for filing a damage claim?" }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "chevron", className: "w-4 h-4" })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold mb-6", children: "Need more specific help?" }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#DEE0E3] rounded-xl shadow-sm overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-6 lg:p-8", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-[#68ADC0]/10 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "mail", className: "w-5 h-5" }) }),
                    /* @__PURE__ */ jsx("h4", { className: "text-xl font-semibold tracking-tight", children: "Send us a Message" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[#91969C] text-sm mb-8", children: "Our team typically responds within 2-4 business hours." }),
                  /* @__PURE__ */ jsxs("form", { className: "space-y-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Full Name" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all", children: [
                          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.svg", alt: "user", className: "w-4 h-4 opacity-40 mr-2" }),
                          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Enter your name", className: "w-full outline-none text-sm" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Email Address" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all", children: [
                          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "mail", className: "w-4 h-4 opacity-40 mr-2" }),
                          /* @__PURE__ */ jsx("input", { type: "email", placeholder: "email@company.com", className: "w-full outline-none text-sm" })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Subject" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all", children: [
                        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", alt: "info", className: "w-4 h-4 opacity-40 mr-2" }),
                        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "e.g., Billing Inquiry", className: "w-full outline-none text-sm" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Message" }),
                      /* @__PURE__ */ jsx(
                        "textarea",
                        {
                          placeholder: "Describe your issue in detail...",
                          rows: 6,
                          className: "w-full border border-[#DEE0E3] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#68ADC0]/20 transition-all resize-none"
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-[#F4F5F6]/30 border-t border-[#DEE0E3] p-6 flex flex-col sm:flex-row items-center justify-between gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[#91969C] text-[12px]", children: [
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", alt: "alert", className: "w-3.5 h-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Please do not share sensitive passwords." })
                  ] }),
                  /* @__PURE__ */ jsx("button", { className: "bg-[#68ADC0] text-white px-8 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#5a99aa] transition-colors w-full sm:w-auto", children: "Send Message" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "xl:col-span-4 space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-[#E9F3F6] rounded-xl shadow-sm overflow-hidden border border-[#68ADC0]/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", alt: "chat", className: "w-5 h-5" }),
                  /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold tracking-tight", children: "Need immediate help?" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[#2C5B68]/80 text-sm mb-6 leading-relaxed", children: "Our agents are online and ready to assist you with active shipments." }),
                /* @__PURE__ */ jsx("button", { className: "w-full bg-[#68ADC0] text-white py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#5a99aa] transition-colors mb-6", children: "Start Live Chat" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-[#68ADC0]/5 border-t border-[#68ADC0]/10 p-6 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", alt: "phone", className: "w-4 h-4 mt-0.5" }),
                  /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "+1 (800) SWIFT-SHIP" }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.svg", alt: "clock", className: "w-4 h-4 mt-0.5 opacity-60" }),
                  /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#91969C]", children: "Mon-Fri: 8AM - 8PM EST" }) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h5", { className: "text-[12px] font-bold text-[#91969C] tracking-widest uppercase mb-4", children: "Knowledge Shortcuts" }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white border border-[#DEE0E3] rounded-xl shadow-sm overflow-hidden", children: [
                /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[#DEE0E3]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.svg", alt: "file", className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Tracking Guide" })
                  ] }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "external", className: "w-3.5 h-3.5 opacity-40" })
                ] }),
                /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[#DEE0E3]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.svg", alt: "alert", className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Prohibited Items List" })
                  ] }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "external", className: "w-3.5 h-3.5 opacity-40" })
                ] }),
                /* @__PURE__ */ jsxs("a", { href: "#", className: "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", alt: "info", className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Customs Regulations" })
                  ] }),
                  /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.svg", alt: "external", className: "w-3.5 h-3.5 opacity-40" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-[#F9FAFA] border border-[#DEE0E3] rounded-xl p-5 shadow-sm flex gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-[#68ADC0]/10 rounded-full flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "search", className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h5", { className: "text-sm font-semibold mb-1", children: "API Documentation" }),
                /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#91969C] leading-relaxed", children: "Looking to integrate SwiftShip? Check our dev portal." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("footer", { className: "mt-20 pt-6 border-t border-[#DEE0E3] flex flex-col md:flex-row items-center justify-between gap-4 pb-10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#91969C]", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ jsx("button", { className: "text-[12px] text-[#91969C] hover:text-[#68ADC0]", children: "Privacy Policy" }),
            /* @__PURE__ */ jsx("button", { className: "text-[12px] text-[#91969C] hover:text-[#68ADC0]", children: "Terms of Service" }),
            /* @__PURE__ */ jsx("button", { className: "text-[12px] text-[#91969C] hover:text-[#68ADC0]", children: "Status" })
          ] })
        ] })
      ] }) })
    ] }),
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/20 z-30 lg:hidden",
        onClick: () => setIsSidebarOpen(false)
      }
    )
  ] });
}
export {
  CusSup as default
};
