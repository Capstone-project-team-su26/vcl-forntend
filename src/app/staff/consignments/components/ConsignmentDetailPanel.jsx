"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  canStaffUpdateConsignmentStatus,
  formatConsignmentDate
} = orderConsignmentService;
function DetailRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-sm font-bold text-muted sm:w-44 shrink-0", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "text-sm font-medium text-ink", children: value })
  ] });
}
function ConsignmentDetailPanel({
  id,
  backHref = "/staff?salesTab=consignments"
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectValidation, setRejectValidation] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvedTrackingCode, setApprovedTrackingCode] = useState(null);
  const canUpdate = detail ? canStaffUpdateConsignmentStatus(detail.status) : false;
  const isSubmitting = isApproving || isRejecting;
  const trackingCode = approvedTrackingCode || detail?.trackingCode;
  useEffect(() => {
    if (!id) return;
    let active = true;
    async function load() {
      setIsLoading(true);
      setError("");
      setActionError("");
      setSuccessMessage("");
      setApprovedTrackingCode(null);
      setRejectionReason("");
      setRejectValidation("");
      try {
        const data = await orderConsignmentService.getStaffConsignment(id);
        if (active) setDetail(data);
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
  }, [id]);
  function applyUpdatedConsignment(next, message, tracking) {
    setDetail(next);
    setSuccessMessage(message);
    setActionError("");
    setRejectValidation("");
    if (tracking) setApprovedTrackingCode(tracking);
  }
  async function handleApprove() {
    if (!detail || !canUpdate || isSubmitting) return;
    setIsApproving(true);
    setActionError("");
    setSuccessMessage("");
    try {
      const response = await orderConsignmentService.updateStaffConsignmentStatus(detail.id, {
        status: "APPROVED"
      });
      const updated = response.consignment ?? {
        ...detail,
        status: response.status ?? "APPROVED",
        trackingCode: response.trackingCode ?? response.shipmentCode
      };
      const code = response.trackingCode ?? response.shipmentCode ?? updated.trackingCode;
      applyUpdatedConsignment(updated, response.message || "Duy\u1EC7t y\xEAu c\u1EA7u th\xE0nh c\xF4ng.", code);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  }
  async function handleReject() {
    if (!detail || !canUpdate || isSubmitting) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectValidation("Vui l\xF2ng nh\u1EADp l\xFD do t\u1EEB ch\u1ED1i.");
      return;
    }
    setIsRejecting(true);
    setActionError("");
    setSuccessMessage("");
    setRejectValidation("");
    try {
      const response = await orderConsignmentService.updateStaffConsignmentStatus(detail.id, {
        status: "REJECTED",
        rejectionReason: reason
      });
      const updated = response.consignment ?? {
        ...detail,
        status: response.status ?? "REJECTED",
        rejectionReason: response.rejectionReason ?? reason
      };
      applyUpdatedConsignment(updated, response.message || "\u0110\xE3 t\u1EEB ch\u1ED1i y\xEAu c\u1EA7u k\xFD g\u1EEDi.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: backHref,
        className: "inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary",
        children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:arrow-left", className: "w-4 h-4" }),
          "Quay l\u1EA1i danh s\xE1ch k\xFD g\u1EEDi"
        ]
      }
    ),
    isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-20 text-muted gap-2", children: [
      /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-5 h-5 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "\u0110ang t\u1EA3i chi ti\u1EBFt..." })
    ] }) : error ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : detail ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-black tracking-tight font-['Oswald']", children: detail.id }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted text-sm mt-2", children: [
            "Y\xEAu c\u1EA7u k\xFD g\u1EEDi c\u1EE7a",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-ink", children: detail.customerName })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted uppercase tracking-wider", children: "Tr\u1EA1ng th\xE1i hi\u1EC7n t\u1EA1i" }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `inline-flex px-4 py-1.5 rounded-full text-sm font-bold ${CONSIGNMENT_STATUS_STYLES[detail.status] || "bg-surface text-muted"}`,
              children: CONSIGNMENT_STATUS_LABELS[detail.status] || detail.status
            }
          )
        ] })
      ] }),
      successMessage ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: successMessage }),
        trackingCode && detail.status === "APPROVED" ? /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
          "M\xE3 g\u1EEDi h\xE0ng:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-bold text-ink", children: trackingCode })
        ] }) : null
      ] }) : null,
      actionError ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: actionError }) : null,
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-extrabold font-['Oswald'] mb-2", children: "Th\xF4ng tin y\xEAu c\u1EA7u" }),
        /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx(DetailRow, { label: "M\xE3 y\xEAu c\u1EA7u", value: detail.id }),
          /* @__PURE__ */ jsx(DetailRow, { label: "T\xEAn kh\xE1ch h\xE0ng", value: detail.customerName }),
          /* @__PURE__ */ jsx(
            DetailRow,
            {
              label: "Lo\u1EA1i k\xFD g\u1EEDi",
              value: CONSIGNMENT_TYPE_LABELS[detail.consignmentType] || detail.consignmentType
            }
          ),
          /* @__PURE__ */ jsx(
            DetailRow,
            {
              label: "Tr\u1EA1ng th\xE1i",
              value: CONSIGNMENT_STATUS_LABELS[detail.status] || detail.status
            }
          ),
          /* @__PURE__ */ jsx(DetailRow, { label: "Ng\xE0y t\u1EA1o", value: formatConsignmentDate(detail.createdAt) }),
          detail.productName ? /* @__PURE__ */ jsx(DetailRow, { label: "S\u1EA3n ph\u1EA9m", value: detail.productName }) : null,
          detail.quantity != null ? /* @__PURE__ */ jsx(DetailRow, { label: "S\u1ED1 l\u01B0\u1EE3ng", value: String(detail.quantity) }) : null,
          detail.destination ? /* @__PURE__ */ jsx(DetailRow, { label: "\u0110i\u1EC3m \u0111\u1EBFn", value: detail.destination }) : null,
          detail.notes ? /* @__PURE__ */ jsx(DetailRow, { label: "Ghi ch\xFA", value: detail.notes }) : null,
          trackingCode ? /* @__PURE__ */ jsx(DetailRow, { label: "M\xE3 g\u1EEDi h\xE0ng", value: trackingCode }) : null,
          detail.rejectionReason ? /* @__PURE__ */ jsx(DetailRow, { label: "L\xFD do t\u1EEB ch\u1ED1i", value: detail.rejectionReason }) : null
        ] })
      ] }),
      canUpdate ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-surface-muted p-6 space-y-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-extrabold font-['Oswald']", children: "X\u1EED l\xFD y\xEAu c\u1EA7u" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: isSubmitting,
            onClick: handleApprove,
            className: "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-success text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity",
            children: [
              isApproving ? /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Icon, { icon: "lucide:check", className: "w-4 h-4" }),
              isApproving ? "\u0110ang duy\u1EC7t..." : "Duy\u1EC7t y\xEAu c\u1EA7u"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-2 border-t border-surface-muted", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "rejectionReason", className: "text-sm font-bold text-ink", children: [
            "L\xFD do t\u1EEB ch\u1ED1i ",
            /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "rejectionReason",
              value: rejectionReason,
              onChange: (e) => {
                setRejectionReason(e.target.value);
                if (rejectValidation) setRejectValidation("");
              },
              rows: 3,
              disabled: isSubmitting,
              placeholder: "Nh\u1EADp l\xFD do \u0111\u1EC3 kh\xE1ch h\xE0ng bi\u1EBFt v\xEC sao y\xEAu c\u1EA7u b\u1ECB t\u1EEB ch\u1ED1i...",
              className: "w-full px-4 py-3 rounded-lg border border-surface-muted text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            }
          ),
          rejectValidation ? /* @__PURE__ */ jsx("p", { className: "text-sm text-danger", children: rejectValidation }) : null,
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              disabled: isSubmitting,
              onClick: handleReject,
              className: "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-danger/40 text-danger text-sm font-bold hover:bg-danger/5 disabled:opacity-60 transition-colors",
              children: [
                isRejecting ? /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Icon, { icon: "lucide:x", className: "w-4 h-4" }),
                isRejecting ? "\u0110ang t\u1EEB ch\u1ED1i..." : "T\u1EEB ch\u1ED1i y\xEAu c\u1EA7u"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-surface-muted bg-surface px-4 py-3 text-sm text-muted", children: "Y\xEAu c\u1EA7u n\xE0y kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt v\xEC \u0111\xE3 h\u1EE7y, \u0111\xE3 nh\u1EADp kho ho\u1EB7c \u0111\xE3 \u0111\u01B0\u1EE3c x\u1EED l\xFD." })
    ] }) : null
  ] });
}
export {
  ConsignmentDetailPanel as default
};
