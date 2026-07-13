"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
import * as restrictedItemService from "@/utils/restrictedItemService";
import { getErrorMessage } from "@/utils/apiError";
const { RESTRICTION_TYPE_LABELS } = restrictedItemService;
const restrictionOptions = Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));
function RestrictedItemFormModal({
  open,
  mode,
  item,
  onClose,
  onSaved
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!open) return null;
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      country: form.elements.namedItem("country").value.trim() || null,
      restrictionType: form.elements.namedItem("restrictionType").value,
      notes: form.elements.namedItem("notes").value.trim(),
      isActive: form.elements.namedItem("isActive").checked
    };
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await restrictedItemService.createRestrictedItem(payload);
        onSaved(response.item, response.message || "Th\xEAm m\u1EB7t h\xE0ng th\xE0nh c\xF4ng.");
      } else if (item) {
        const response = await restrictedItemService.updateRestrictedItem(item.id, payload);
        onSaved(response.item, response.message || "C\u1EADp nh\u1EADt m\u1EB7t h\xE0ng th\xE0nh c\xF4ng.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "absolute inset-0 bg-background/70 backdrop-blur-sm",
        onClick: onClose,
        "aria-label": "\u0110\xF3ng"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-surface rounded-xl border border-border shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-muted", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-ink", children: mode === "create" ? "Th\xEAm h\xE0ng c\u1EA5m/h\u1EA1n ch\u1EBF" : "Ch\u1EC9nh s\u1EEDa m\u1EB7t h\xE0ng" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "p-2 text-muted hover:text-ink", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:x", className: "w-5 h-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
        error ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "text-sm font-semibold text-ink", children: [
            "T\xEAn m\u1EB7t h\xE0ng ",
            /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "name",
              name: "name",
              required: true,
              defaultValue: item?.name ?? "",
              placeholder: "VD: Pin lithium lo\u1EA1i l\u1EDBn",
              className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "country", className: "text-sm font-semibold text-ink", children: "Qu\u1ED1c gia \xE1p d\u1EE5ng" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "country",
              name: "country",
              defaultValue: item?.country ?? "",
              placeholder: "VD: VN, US \u2014 \u0111\u1EC3 tr\u1ED1ng = t\u1EA5t c\u1EA3 qu\u1ED1c gia",
              className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "restrictionType", className: "text-sm font-semibold text-ink", children: [
            "Lo\u1EA1i h\u1EA1n ch\u1EBF ",
            /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "restrictionType",
              name: "restrictionType",
              required: true,
              defaultValue: item?.restrictionType ?? "RESTRICTED",
              className: "w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring",
              children: restrictionOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "notes", className: "text-sm font-semibold text-ink", children: "Ghi ch\xFA / l\xFD do h\u1EA1n ch\u1EBF" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "notes",
              name: "notes",
              rows: 3,
              defaultValue: item?.notes ?? "",
              placeholder: "M\xF4 t\u1EA3 l\xFD do h\u1EA1n ch\u1EBF \u0111\u1EC3 Customer v\xE0 Staff tham kh\u1EA3o...",
              className: "w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            }
          )
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
              children: isSubmitting ? "\u0110ang l\u01B0u..." : mode === "create" ? "Th\xEAm m\u1EB7t h\xE0ng" : "L\u01B0u thay \u0111\u1ED5i"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  RestrictedItemFormModal as default
};
