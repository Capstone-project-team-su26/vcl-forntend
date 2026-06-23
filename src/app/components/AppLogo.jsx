"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
function AppLogo({ variant = "sidebar", className = "" }) {
  if (variant === "header") {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: `flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "SwiftShip", className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-[20px] font-[900] tracking-[-1px] uppercase", children: "SWIFTSHIP" })
        ]
      }
    );
  }
  if (variant === "auth") {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: `flex items-center gap-2.5 hover:opacity-80 transition-opacity ${className}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-primary rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:package", className: "w-5 h-5 text-white" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-ink tracking-tight", children: "SwiftShip" })
        ]
      }
    );
  }
  if (variant === "register") {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: `flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-secondary rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "LogiAccess", className: "w-8 h-8" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-secondary text-[31px] font-bold tracking-tight", children: "LogiAccess" })
        ]
      }
    );
  }
  if (variant === "register-mobile") {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: `flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-secondary rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "LogiAccess", className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-secondary text-xl font-bold", children: "LogiAccess" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: "/",
      className: `flex items-center hover:opacity-80 transition-opacity ${className}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_1.svg", alt: "SwiftShip", className: "w-5.5 h-5.5" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-['Oswald'] text-xl font-black text-primary tracking-tight", children: "SwiftShip" })
      ]
    }
  );
}
export {
  AppLogo as default
};
