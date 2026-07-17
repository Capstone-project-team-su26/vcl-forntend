import styles from "./chatbox.module.scss";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
function ChatBox() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: styles.t856298, children: [
    /* @__PURE__ */ jsxs("header", { className: styles.t167b0b, children: [
      /* @__PURE__ */ jsxs("div", { className: styles.tf86553, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles.t8fa731,
            onClick: () => setIsSidebarOpen(!isSidebarOpen),
            children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: styles.t6da34c })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: styles.tc55d9a, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_4.svg", alt: "Logo", className: styles.tba9b15 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.t2fcf0c, children: "SwiftShip" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles.t3abd71, children: /* @__PURE__ */ jsxs("div", { className: styles.t5ee29c, children: [
        /* @__PURE__ */ jsx("img", { src: "/assets/IMG_1.svg", alt: "Search", className: styles.td29b71 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search messages, users, or requests...",
            className: styles.t671d6a
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: styles.t9f3dbb, children: [
        /* @__PURE__ */ jsx("div", { className: styles.tf85458, children: /* @__PURE__ */ jsx("button", { className: styles.tcb959e, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_3.svg", alt: "Notifications", className: styles.t0e4cd7 }) }) }),
        /* @__PURE__ */ jsxs("div", { className: styles.tf86553, children: [
          /* @__PURE__ */ jsxs("div", { className: styles.t985e49, children: [
            /* @__PURE__ */ jsx("p", { className: styles.t8cfca0, children: "Alex Johnson" }),
            /* @__PURE__ */ jsx("p", { className: styles.t941fd1, children: "Premium Account" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.td89972, children: [
            /* @__PURE__ */ jsx("div", { className: styles.t444572, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_2.jpeg", alt: "User", className: styles.t6c9d07 }) }),
            /* @__PURE__ */ jsx("div", { className: styles.tf2b8dd })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles.t54761e, children: [
      /* @__PURE__ */ jsxs("aside", { className: `${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`, children: [
        /* @__PURE__ */ jsxs("div", { className: styles.t066e4e, children: [
          /* @__PURE__ */ jsx("h2", { className: styles.t6f4a18, children: "Messages" }),
          /* @__PURE__ */ jsx("button", { className: styles.tbcaab4, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_5.svg", alt: "Filter", className: styles.t0bfbea }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles.td6f0aa} custom-scrollbar`, children: [
          /* @__PURE__ */ jsxs("div", { className: styles.tb8f5ee, children: [
            /* @__PURE__ */ jsxs("div", { className: styles.td452ad, children: [
              /* @__PURE__ */ jsx("img", { src: "/assets/IMG_6.webp", alt: "Sarah", className: styles.t7ae6f4 }),
              /* @__PURE__ */ jsx("div", { className: styles.tf2b8dd })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles.td42112, children: [
              /* @__PURE__ */ jsxs("div", { className: styles.te6377b, children: [
                /* @__PURE__ */ jsx("h3", { className: styles.ta789ef, children: "Sarah Jenkins" }),
                /* @__PURE__ */ jsx("span", { className: styles.t889401, children: "10:42 AM" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: styles.t56e6b9, children: [
                /* @__PURE__ */ jsx("p", { className: styles.tf0071e, children: "I've attached the latest inspection..." }),
                /* @__PURE__ */ jsx("span", { className: styles.te23c8e, children: "2" })
              ] })
            ] })
          ] }),
          [
            { name: "Michael Chen", time: "Yesterday", msg: "Can you confirm the dimensions?", img: "/assets/IMG_7.webp", status: "none" },
            { name: "Emma Davis", time: "Oct 24", msg: "The customs clearance is delayed.", img: "/assets/IMG_8.webp", status: "away" }
          ].map((chat, i) => /* @__PURE__ */ jsxs("div", { className: styles.t70f8c5, children: [
            /* @__PURE__ */ jsxs("div", { className: styles.td452ad, children: [
              /* @__PURE__ */ jsx("img", { src: chat.img, alt: chat.name, className: styles.t7ae6f4 }),
              chat.status === "away" && /* @__PURE__ */ jsx("div", { className: styles.t10ac6c })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles.td42112, children: [
              /* @__PURE__ */ jsxs("div", { className: styles.te6377b, children: [
                /* @__PURE__ */ jsx("h3", { className: styles.ta789ef, children: chat.name }),
                /* @__PURE__ */ jsx("span", { className: styles.t941fd1, children: chat.time })
              ] }),
              /* @__PURE__ */ jsx("p", { className: styles.tec7f0c, children: chat.msg })
            ] })
          ] }, i))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: styles.ta3cd6f, children: [
        /* @__PURE__ */ jsxs("div", { className: styles.t4035b2, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: styles.tc982d7, children: "Sarah Jenkins" }),
            /* @__PURE__ */ jsx("p", { className: styles.t2b8d50, children: "Logistics Coordinator \u2022 REQ-8821" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.t6cfc7e, children: [
            /* @__PURE__ */ jsx("button", { className: styles.t594847, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_9.svg", alt: "Call", className: styles.ta8600f }) }),
            /* @__PURE__ */ jsx("button", { className: styles.t594847, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_10.svg", alt: "Video", className: styles.ta8600f }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: styles.td2434b,
                onClick: () => setIsDetailsOpen(!isDetailsOpen),
                children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:info", className: styles.t0e4cd7 })
              }
            ),
            /* @__PURE__ */ jsx("button", { className: styles.tae19a7, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_11.svg", alt: "More", className: styles.ta8600f }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles.t865d29} custom-scrollbar`, children: [
          /* @__PURE__ */ jsx("div", { className: styles.tac2b11, children: /* @__PURE__ */ jsx("span", { className: styles.tec4d71, children: "Today, Oct 26" }) }),
          /* @__PURE__ */ jsxs("div", { className: styles.t2ecb6e, children: [
            /* @__PURE__ */ jsx("img", { src: "/assets/IMG_12.webp", alt: "Sarah", className: styles.tb4ac7d }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles.t9034b9, children: /* @__PURE__ */ jsx("p", { className: styles.t7f9a87, children: "Hi Alex, just wanted to update you on REQ-8821. The industrial turbines have arrived at the Berlin Main Logistics Center." }) }),
              /* @__PURE__ */ jsx("span", { className: styles.ta7d849, children: "10:30 AM" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.tb11702, children: [
            /* @__PURE__ */ jsx("div", { className: styles.t9bbbbe, children: /* @__PURE__ */ jsx("p", { className: styles.t610727, children: "That's great news! Are they on track for the final delivery tomorrow?" }) }),
            /* @__PURE__ */ jsx("span", { className: styles.tea4d63, children: "10:35 AM" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.t2ecb6e, children: [
            /* @__PURE__ */ jsx("img", { src: "/assets/IMG_13.webp", alt: "Sarah", className: styles.tb4ac7d }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles.teb3f6e, children: /* @__PURE__ */ jsx("p", { className: styles.t7f9a87, children: "Yes, they are currently being processed. The local courier will pick them up early morning. I've attached the latest inspection photos." }) }),
              /* @__PURE__ */ jsxs("div", { className: styles.t81ef4a, children: [
                /* @__PURE__ */ jsx("div", { className: styles.t181933, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_14.webp", alt: "Inspection 1", className: styles.t6c9d07 }) }),
                /* @__PURE__ */ jsx("div", { className: styles.t181933, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_15.webp", alt: "Inspection 2", className: styles.t6c9d07 }) })
              ] }),
              /* @__PURE__ */ jsx("span", { className: styles.ta7d849, children: "10:42 AM" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles.t00356f, children: /* @__PURE__ */ jsxs("div", { className: styles.t545d27, children: [
          /* @__PURE__ */ jsx("button", { className: styles.tfc966a, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_16.svg", alt: "Attach", className: styles.ta8600f }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Type your message...",
              className: styles.t4dc188
            }
          ),
          /* @__PURE__ */ jsx("button", { className: styles.tfc966a, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_17.svg", alt: "Emoji", className: styles.ta8600f }) }),
          /* @__PURE__ */ jsx("button", { className: styles.t8336f5, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_18.svg", alt: "Send", className: styles.t0bfbea }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: `${styles.detailsPanel} ${isDetailsOpen ? styles.detailsOpen : styles.detailsClosed}`, children: /* @__PURE__ */ jsxs("div", { className: `${styles.t47c68b} custom-scrollbar`, children: [
        /* @__PURE__ */ jsxs("div", { className: styles.t5972d8, children: [
          /* @__PURE__ */ jsx("h2", { className: styles.t6f4a18, children: "Product Details" }),
          /* @__PURE__ */ jsx("span", { className: styles.t2f7f52, children: "In Transit" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles.t82c555, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_19.webp", alt: "Product", className: styles.t63bffe }) }),
        /* @__PURE__ */ jsxs("div", { className: styles.mb6, children: [
          /* @__PURE__ */ jsx("h3", { className: styles.t22c170, children: "Industrial Turbines (Model X)" }),
          /* @__PURE__ */ jsx("p", { className: styles.t2b8d50, children: "REQ-8821" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles.t6f7eb5, children: [
          /* @__PURE__ */ jsxs("div", { className: styles.t9cbf69, children: [
            /* @__PURE__ */ jsx("span", { className: styles.td19d5e, children: "Quantity" }),
            /* @__PURE__ */ jsx("span", { className: styles.tf3f8f3, children: "2 Units" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.t9cbf69, children: [
            /* @__PURE__ */ jsx("span", { className: styles.td19d5e, children: "Destination" }),
            /* @__PURE__ */ jsx("span", { className: styles.tf3f8f3, children: "Berlin, Germany" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.t9cbf69, children: [
            /* @__PURE__ */ jsx("span", { className: styles.td19d5e, children: "Estimated Arrival" }),
            /* @__PURE__ */ jsx("span", { className: styles.tf3f8f3, children: "Oct 28, 2023" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles.t76eede, children: [
          /* @__PURE__ */ jsx("h4", { className: styles.t92d74e, children: "Attachments" }),
          /* @__PURE__ */ jsx("div", { className: styles.t6ed543, children: [
            { name: "Invoice_REQ-8821.pdf", size: "1.2 MB", icon: "/assets/IMG_20.svg" },
            { name: "Inspection_Photos.zip", size: "8.5 MB", icon: "/assets/IMG_22.svg" },
            { name: "Spec_Sheet.pdf", size: "845 KB", icon: "/assets/IMG_20.svg" }
          ].map((file, i) => /* @__PURE__ */ jsxs("div", { className: styles.t760719, children: [
            /* @__PURE__ */ jsx("div", { className: styles.t37e147, children: /* @__PURE__ */ jsx("img", { src: file.icon, alt: "File", className: styles.t5c8457 }) }),
            /* @__PURE__ */ jsxs("div", { className: styles.td42112, children: [
              /* @__PURE__ */ jsx("p", { className: styles.t815490, children: file.name }),
              /* @__PURE__ */ jsx("p", { className: styles.t941fd1, children: file.size })
            ] }),
            /* @__PURE__ */ jsx("button", { className: styles.tb9962a, children: /* @__PURE__ */ jsx("img", { src: "/assets/IMG_21.svg", alt: "Download", className: styles.t0bfbea }) })
          ] }, i)) })
        ] })
      ] }) }),
      (isSidebarOpen || isDetailsOpen) && /* @__PURE__ */ jsx(
        "div",
        {
          className: styles.tfe386d,
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
