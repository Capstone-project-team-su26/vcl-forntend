"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as consignmentService from "@/utils/consignmentService";
import { getErrorMessage } from "@/utils/apiError";
const STATUS_CLASS = {
  Pending: "bg-warning-bg text-warning-text",
  Approved: "bg-success-bg text-success-text",
  Processing: "bg-info-bg text-info-text",
  Draft: "bg-surface text-muted"
};
function ConsignmentRequestPage() {
  const [requests, setRequests] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [data, warehouseList] = await Promise.all([
          consignmentService.listPurchaseRequests(),
          consignmentService.getWarehouses()
        ]);
        if (active) {
          setRequests(data);
          setWarehouses(warehouseList);
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = e.currentTarget;
    const payload = {
      productLink: form.productLink?.value?.trim(),
      productName: form.productName?.value?.trim(),
      quantity: form.quantity?.value?.trim(),
      destination: form.destination?.value,
      requiredBy: form.requiredBy?.value
    };
    if (!payload.productName || !payload.destination) {
      setError("Vui l\xF2ng nh\u1EADp t\xEAn s\u1EA3n ph\u1EA9m v\xE0 kho \u0111\xEDch.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await consignmentService.createPurchaseRequest(payload);
      setMessage(response.message);
      const data = await consignmentService.listPurchaseRequests();
      setRequests(data);
      form.reset();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleSaveDraft(e) {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await consignmentService.savePurchaseRequestDraft({
        productLink: form.productLink?.value?.trim(),
        productName: form.productName?.value?.trim() || "Draft request",
        quantity: form.quantity?.value?.trim() || "0",
        destination: form.destination?.value || "HCM Hub",
        requiredBy: form.requiredBy?.value
      });
      setMessage(response.message);
      const data = await consignmentService.listPurchaseRequests();
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white font-['Open_Sans'] text-ink-deep", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 w-full bg-white border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-4 lg:px-[152px] h-[72px] flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(AppLogo, { variant: "header" }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center gap-8", children: [
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.svg", alt: "Track", className: "w-4 h-4" }),
          "Track & Receive"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_3.svg", alt: "Pricing", className: "w-4 h-4" }),
          "Pricing & Services"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors", children: [
          /* @__PURE__ */ jsx("img", { src: "./assets/IMG_2.svg", alt: "Contact", className: "w-4 h-4" }),
          "Contact"
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "md:hidden p-2", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:menu", className: "w-6 h-6" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("section", { className: "bg-surface-alt py-12 lg:py-[60px]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-4 lg:px-[208px]", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-[36px] leading-[44px] font-[900] tracking-[-0.75px] mb-2", children: "Create Purchase Request" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted text-[16px] mb-10", children: "Fill out the details below to initiate a new procurement request." }),
        error ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
        message ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: message }) : null,
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[16px] shadow-[0px_4px_24px_0px_#0000000a] p-6 lg:p-8", children: /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Product Link" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                name: "productLink",
                type: "text",
                placeholder: "Product link",
                className: "w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Product Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  name: "productName",
                  type: "text",
                  required: true,
                  placeholder: "Enter product name",
                  className: "w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Quantity" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  name: "quantity",
                  type: "number",
                  min: "1",
                  placeholder: "0",
                  className: "w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Destination Warehouse" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    name: "destination",
                    required: true,
                    defaultValue: "",
                    className: "w-full h-12 px-4 rounded-lg border border-secondary/30 appearance-none bg-white focus:border-primary outline-none",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select warehouse" }),
                      warehouses.map((warehouse) => /* @__PURE__ */ jsx("option", { value: warehouse, children: warehouse }, warehouse))
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:chevron-down", className: "absolute right-4 top-1/2 -translate-y-1/2 text-muted" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Required By" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  name: "requiredBy",
                  type: "date",
                  className: "w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary outline-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Priority" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 h-12", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ jsx("input", { type: "radio", name: "priority", className: "w-[18px] h-[18px] accent-muted" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[14px]", children: "Normal" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ jsx("input", { type: "radio", name: "priority", className: "w-[18px] h-[18px] accent-muted" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[14px]", children: "Urgent" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[14px] font-bold", children: "Notes" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  name: "notes",
                  type: "text",
                  className: "w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary outline-none"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 pt-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: isSubmitting,
                className: "h-12 px-8 bg-primary text-white font-bold rounded-lg shadow-[0px_4px_8px_0px_#00000014] hover:bg-primary-hover transition-colors disabled:opacity-60",
                children: isSubmitting ? "Submitting..." : "Submit Request"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                disabled: isSubmitting,
                onClick: handleSaveDraft,
                className: "h-12 px-8 border border-ink text-ink font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60",
                children: "Save Draft"
              }
            )
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-4 lg:px-[208px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-[24px] leading-[32px] font-[900] tracking-[0px]", children: "Recent Requests" }),
          /* @__PURE__ */ jsx("button", { className: "text-primary font-bold text-[14px] hover:underline", children: "View All" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border border-border rounded-[12px] overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-surface border-b border-border", children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Request ID" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Product" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Qty" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Destination" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-sm text-muted", children: "\u0110ang t\u1EA3i y\xEAu c\u1EA7u..." }) }) : requests.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-sm text-muted", children: "Ch\u01B0a c\xF3 y\xEAu c\u1EA7u n\xE0o." }) }) : requests.map((row) => /* @__PURE__ */ jsxs("tr", { className: "table-row-hover", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-[14px] font-semibold", children: row.id }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-[14px] text-muted", children: row.productName }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-[14px] text-muted", children: row.quantity }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-[14px] text-muted", children: row.destination }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `status-badge ${row.statusClass || STATUS_CLASS[row.status] || ""}`, children: row.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("img", { src: "./assets/IMG_4.svg", alt: "Actions", className: "w-[18px] h-[18px] cursor-pointer" }) })
          ] }, row.id)) })
        ] }) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "bg-ink-deep text-white pt-16 pb-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-4 lg:px-[152px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 space-y-6", children: [
          /* @__PURE__ */ jsx(AppLogo, { variant: "header" }),
          /* @__PURE__ */ jsx("p", { className: "text-faint text-[16px] leading-[24px] max-w-[353px]", children: "Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 lg:col-start-8", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[14px] font-bold uppercase mb-6", children: "Support" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-faint text-[14px]", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Help Center" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Tracking Guide" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Prohibited Items" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[14px] font-bold uppercase mb-6", children: "Legal" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-faint text-[14px]", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Terms of Service" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Privacy Policy" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Cookie Policy" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-subtle text-[12px]", children: "\xA9 2024 SwiftShip Logistics Inc. All rights reserved." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 text-subtle text-[12px]", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Facebook" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "LinkedIn" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Twitter" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ConsignmentRequestPage as default
};
