"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as pricingRuleService from "@/utils/pricingRuleService";
import { getErrorMessage } from "@/utils/apiError";
const {
  SHIPPING_SERVICE_TYPE_LABELS,
  CONSIGNMENT_TYPE_LABELS,
  BILLING_UNIT_LABELS
} = pricingRuleService;
const shippingOptions = Object.entries(SHIPPING_SERVICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));
const consignmentOptions = Object.entries(CONSIGNMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));
const billingOptions = Object.entries(BILLING_UNIT_LABELS).map(([value, label]) => ({
  value,
  label
}));
function PricingRuleFormModal({
  open,
  mode,
  item,
  onClose,
  onSaved
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingUnit, setBillingUnit] = useState(item?.billingUnit ?? "KG");
  useEffect(() => {
    if (open) setBillingUnit(item?.billingUnit ?? "KG");
  }, [open, item]);
  if (!open) return null;
  const showKg = billingUnit === "KG" || billingUnit === "KG_OR_CBM";
  const showCbm = billingUnit === "CBM" || billingUnit === "KG_OR_CBM";
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const payload = {
      shippingServiceType: form.shippingServiceType.value,
      consignmentType: form.consignmentType.value,
      route: form.route.value.trim() || null,
      billingUnit: form.billingUnit.value,
      pricePerKg: showKg ? form.pricePerKg.value : null,
      pricePerCbm: showCbm ? form.pricePerCbm.value : null,
      serviceFee: form.serviceFee.value,
      isActive: form.isActive.checked
    };
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await pricingRuleService.createPricingRule(payload);
        onSaved(response.item, response.message || "Th\xEAm c\u1EA5u h\xECnh gi\xE1 th\xE0nh c\xF4ng.");
      } else if (item) {
        const response = await pricingRuleService.updatePricingRule(item.id, payload);
        onSaved(response.item, response.message || "C\u1EADp nh\u1EADt c\u1EA5u h\xECnh gi\xE1 th\xE0nh c\xF4ng.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-black/40", onClick: onClose, "aria-label": "\u0110\xF3ng" }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-xl bg-surface-elevated rounded-xl border border-border-muted shadow-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-ink", children: mode === "create" ? "Th\xEAm c\u1EA5u h\xECnh gi\xE1" : "Ch\u1EC9nh s\u1EEDa c\u1EA5u h\xECnh gi\xE1" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "p-2 text-muted hover:text-ink", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:x", className: "w-5 h-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
        error ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "shippingServiceType", className: "text-sm font-semibold text-ink", children: [
              "Lo\u1EA1i d\u1ECBch v\u1EE5 v\u1EADn chuy\u1EC3n ",
              /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "shippingServiceType",
                name: "shippingServiceType",
                required: true,
                defaultValue: item?.shippingServiceType ?? "STANDARD",
                className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring",
                children: shippingOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "consignmentType", className: "text-sm font-semibold text-ink", children: [
              "Lo\u1EA1i k\xFD g\u1EEDi ",
              /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "consignmentType",
                name: "consignmentType",
                required: true,
                defaultValue: item?.consignmentType ?? "CONSIGNMENT",
                className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring",
                children: consignmentOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "route", className: "text-sm font-semibold text-ink", children: "Qu\u1ED1c gia / tuy\u1EBFn v\u1EADn chuy\u1EC3n" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "route",
              name: "route",
              defaultValue: item?.route ?? "",
              placeholder: "VD: VN-US, VN-JP \u2014 \u0111\u1EC3 tr\u1ED1ng = t\u1EA5t c\u1EA3 tuy\u1EBFn",
              className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "billingUnit", className: "text-sm font-semibold text-ink", children: [
            "\u0110\u01A1n v\u1ECB t\xEDnh ph\xED ",
            /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "billingUnit",
              name: "billingUnit",
              required: true,
              value: billingUnit,
              onChange: (e) => setBillingUnit(e.target.value),
              className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring",
              children: billingOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          showKg ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "pricePerKg", className: "text-sm font-semibold text-ink", children: [
              "Gi\xE1 theo c\xE2n n\u1EB7ng (USD/kg) ",
              /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "pricePerKg",
                name: "pricePerKg",
                type: "number",
                min: "0",
                step: "0.01",
                required: showKg,
                defaultValue: item?.pricePerKg ?? "",
                className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              }
            )
          ] }) : null,
          showCbm ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "pricePerCbm", className: "text-sm font-semibold text-ink", children: [
              "Gi\xE1 theo th\u1EC3 t\xEDch (USD/CBM) ",
              /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "pricePerCbm",
                name: "pricePerCbm",
                type: "number",
                min: "0",
                step: "0.01",
                required: showCbm,
                defaultValue: item?.pricePerCbm ?? "",
                className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              }
            )
          ] }) : null,
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "serviceFee", className: "text-sm font-semibold text-ink", children: [
              "Ph\xED d\u1ECBch v\u1EE5 (USD) ",
              /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "serviceFee",
                name: "serviceFee",
                type: "number",
                min: "0",
                step: "0.01",
                required: true,
                defaultValue: item?.serviceFee ?? "",
                className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              name: "isActive",
              defaultChecked: item?.isActive ?? true,
              className: "w-4 h-4 rounded border-border-muted accent-primary"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-ink font-medium", children: "\u0110ang ho\u1EA1t \u0111\u1ED9ng" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:bg-surface",
              children: "H\u1EE7y"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isSubmitting,
              className: "h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold disabled:opacity-60",
              children: isSubmitting ? "\u0110ang l\u01B0u..." : mode === "create" ? "Th\xEAm c\u1EA5u h\xECnh" : "L\u01B0u thay \u0111\u1ED5i"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  PricingRuleFormModal as default
};
