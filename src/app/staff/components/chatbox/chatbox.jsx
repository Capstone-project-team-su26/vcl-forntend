import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function ChatBox() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen bg-white overflow-hidden font-sans", children: [
    /* @__PURE__ */ jsxs("header", { className: "h-16 border-b border-[#DEE0E3] flex items-center justify-between px-4 lg:px-8 shrink-0 z-50 bg-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "lg:hidden p-2 hover:bg-gray-100 rounded-md",
            onClick: () => setIsSidebarOpen(!isSidebarOpen),
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6 text-[#68ADC0]" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-[#68ADC0] rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_4.svg", alt: "Logo", className: "w-5.5 h-5.5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[20px] font-bold text-[#68ADC0] hidden sm:block", children: "SwiftShip" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-md mx-4 lg:mx-12", children: /* @__PURE__ */ jsxs("div", { className: "relative flex items-center w-full h-10 px-3 bg-[#F4F5F6]/50 rounded-md", children: [
        /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "Search", className: "w-4 h-4 text-[#91969C]" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search messages, users, or requests...",
            className: "w-full ml-2 text-sm text-[#1E2124] placeholder:text-[#91969C] outline-none bg-transparent"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 lg:gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-4 pr-4 border-r border-[#DEE0E3]", children: /* @__PURE__ */ jsx("button", { className: "relative p-1 hover:bg-gray-100 rounded-full", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_3.svg", alt: "Notifications", className: "w-5 h-5 text-[#91969C]" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right hidden sm:block", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#1E2124] leading-tight", children: "Alex Johnson" }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#91969C]", children: "Premium Account" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full overflow-hidden border border-gray-100", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.jpeg", alt: "User", className: "w-full h-full object-cover" }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden relative", children: [
      /* @__PURE__ */ jsxs("aside", { className: `
          fixed inset-y-0 left-0 z-40 w-80 bg-[#F4F5F6]/20 border-r border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `, children: [
        /* @__PURE__ */ jsxs("div", { className: "h-16 flex items-center justify-between px-4 border-b border-[#DEE0E3]", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[#1E2124]", children: "Messages" }),
          /* @__PURE__ */ jsx("button", { className: "p-1 hover:bg-gray-200 rounded", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_5.svg", alt: "Filter", className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "overflow-y-auto h-[calc(100%-64px)] custom-scrollbar", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex items-center p-4 bg-[#68ADC0]/10 border-l-4 border-[#68ADC0] cursor-pointer", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsx("img", { src: "./assets/IMG_6.webp", alt: "Sarah", className: "w-10 h-10 rounded-full object-cover" }),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-[#1E2124] truncate", children: "Sarah Jenkins" }),
                /* @__PURE__ */ jsx("span", { className: "text-[12px] text-[#68ADC0] font-medium", children: "10:42 AM" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-[#1E2124] font-medium truncate", children: "I've attached the latest inspection..." }),
                /* @__PURE__ */ jsx("span", { className: "bg-[#EA1E1A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2", children: "2" })
              ] })
            ] })
          ] }),
          [
            { name: "Michael Chen", time: "Yesterday", msg: "Can you confirm the dimensions?", img: "./assets/IMG_7.webp", status: "none" },
            { name: "Emma Davis", time: "Oct 24", msg: "The customs clearance is delayed.", img: "./assets/IMG_8.webp", status: "away" }
          ].map((chat, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-transparent", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsx("img", { src: chat.img, alt: chat.name, className: "w-10 h-10 rounded-full object-cover" }),
              chat.status === "away" && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F59E0B] border-2 border-white rounded-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-[#1E2124] truncate", children: chat.name }),
                /* @__PURE__ */ jsx("span", { className: "text-[12px] text-[#91969C]", children: chat.time })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-[#91969C] truncate", children: chat.msg })
            ] })
          ] }, i))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col bg-white min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "h-[101px] px-6 flex items-center justify-between border-b border-[#DEE0E3] shrink-0", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-[#1E2124]", children: "Sarah Jenkins" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#91969C]", children: "Logistics Coordinator \u2022 REQ-8821" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-100 rounded-md", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_9.svg", alt: "Call", className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-100 rounded-md", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_10.svg", alt: "Video", className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "p-2 hover:bg-gray-100 rounded-md lg:hidden",
                onClick: () => setIsDetailsOpen(!isDetailsOpen),
                children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:info", className: "w-5 h-5 text-[#91969C]" })
              }
            ),
            /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-100 rounded-md hidden lg:block", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_11.svg", alt: "More", className: "w-5 h-5" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 bg-[#F4F5F6]/10 custom-scrollbar", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-[#F4F5F6] text-[#91969C] text-[12px] font-medium rounded-full", children: "Today, Oct 26" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-6 max-w-[85%]", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_12.webp", alt: "Sarah", className: "w-8 h-8 rounded-full shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#F4F5F6] p-3.5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#1E2124] leading-relaxed", children: "Hi Alex, just wanted to update you on REQ-8821. The industrial turbines have arrived at the Berlin Main Logistics Center." }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[12px] text-[#91969C] mt-1 block", children: "10:30 AM" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "max-w-[85%] bg-[#68ADC0] p-3.5 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-sm", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-white leading-relaxed", children: "That's great news! Are they on track for the final delivery tomorrow?" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[12px] text-[#91969C] mt-1", children: "10:35 AM" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-6 max-w-[85%]", children: [
            /* @__PURE__ */ jsx("img", { src: "./assets/IMG_13.webp", alt: "Sarah", className: "w-8 h-8 rounded-full shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#F4F5F6] p-3.5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl mb-2", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#1E2124] leading-relaxed", children: "Yes, they are currently being processed. The local courier will pick them up early morning. I've attached the latest inspection photos." }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("div", { className: "w-32 h-24 rounded-lg overflow-hidden border border-[#DEE0E3]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_14.webp", alt: "Inspection 1", className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsx("div", { className: "w-32 h-24 rounded-lg overflow-hidden border border-[#DEE0E3]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_15.webp", alt: "Inspection 2", className: "w-full h-full object-cover" }) })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[12px] text-[#91969C] mt-1 block", children: "10:42 AM" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-[#DEE0E3] bg-white", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-[#F4F5F6]/50 border border-[#DEE0E3] rounded-2xl p-2", children: [
          /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-200 rounded-xl", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_16.svg", alt: "Attach", className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Type your message...",
              className: "flex-1 bg-transparent outline-none text-sm px-2 py-2"
            }
          ),
          /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-200 rounded-xl", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_17.svg", alt: "Emoji", className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("button", { className: "bg-[#68ADC0] p-2.5 rounded-xl shadow-sm hover:bg-[#5a99aa]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_18.svg", alt: "Send", className: "w-4 h-4" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: `
          fixed inset-y-0 right-0 z-40 w-90 bg-[#F4F5F6]/20 border-l border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isDetailsOpen ? "translate-x-0" : "translate-x-full"}
        `, children: /* @__PURE__ */ jsxs("div", { className: "p-6 h-full overflow-y-auto custom-scrollbar", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[#1E2124]", children: "Product Details" }),
          /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-semibold rounded-full border border-[#BFDBFE]", children: "In Transit" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden border border-[#DEE0E3] shadow-sm mb-6", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_19.webp", alt: "Product", className: "w-full h-44 object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-[#1E2124]", children: "Industrial Turbines (Model X)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#91969C]", children: "REQ-8821" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#91969C]", children: "Quantity" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#1E2124] font-medium", children: "2 Units" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#91969C]", children: "Destination" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#1E2124] font-medium", children: "Berlin, Germany" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#91969C]", children: "Estimated Arrival" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#1E2124] font-medium", children: "Oct 28, 2023" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-[#DEE0E3] pt-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[12px] font-bold text-[#91969C] tracking-wider uppercase mb-4", children: "Attachments" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
            { name: "Invoice_REQ-8821.pdf", size: "1.2 MB", icon: "./assets/IMG_20.svg" },
            { name: "Inspection_Photos.zip", size: "8.5 MB", icon: "./assets/IMG_22.svg" },
            { name: "Spec_Sheet.pdf", size: "845 KB", icon: "./assets/IMG_20.svg" }
          ].map((file, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center p-3 bg-white rounded-xl border border-[#DEE0E3] shadow-sm hover:border-[#68ADC0] cursor-pointer group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-[#F4F5F6] rounded-md flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("img", { src: file.icon, alt: "File", className: "w-5 h-5 text-[#68ADC0]" }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#1E2124] truncate", children: file.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#91969C]", children: file.size })
            ] }),
            /* @__PURE__ */ jsx("button", { className: "p-1 text-[#91969C] hover:text-[#68ADC0]", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_21.svg", alt: "Download", className: "w-4 h-4" }) })
          ] }, i)) })
        ] })
      ] }) }),
      (isSidebarOpen || isDetailsOpen) && /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 bg-black/20 z-30 lg:hidden",
          onClick: () => {
            setIsSidebarOpen(false);
            setIsDetailsOpen(false);
          }
        }
      )
    ] })
  ] });
}
export {
  ChatBox as default
};
