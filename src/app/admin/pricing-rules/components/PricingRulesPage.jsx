"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import PricingRuleFormModal from "./PricingRuleFormModal";
import * as pricingRuleService from "@/utils/pricingRuleService";
import { getErrorMessage } from "@/utils/apiError";
const {
  SHIPPING_SERVICE_TYPE_LABELS,
  CONSIGNMENT_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  formatPricingRoute,
  formatMoney
} = pricingRuleService;
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\xE1i" },
  { value: "true", label: "\u0110ang ho\u1EA1t \u0111\u1ED9ng" },
  { value: "false", label: "V\xF4 hi\u1EC7u" }
];
function ActiveBadge({ isActive }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block px-3 py-1 rounded-full text-[11px] font-bold ${isActive ? "bg-success-bg text-success-text" : "bg-surface text-muted"}`,
      children: isActive ? "Ho\u1EA1t \u0111\u1ED9ng" : "V\xF4 hi\u1EC7u"
    }
  );
}
function PricingRulesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setActionError("");
      try {
        const data = await pricingRuleService.listPricingRules({
          search: search || void 0,
          isActive: statusFilter === "" ? void 0 : statusFilter
        });
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (active) setItems(list);
      } catch (err) {
        if (active) setActionError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [search, statusFilter]);
  function openCreate() {
    setEditingItem(null);
    setModalMode("create");
  }
  function openEdit(item) {
    setEditingItem(item);
    setModalMode("edit");
  }
  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
  }
  function handleSaved(item, message) {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) return current.map((entry) => entry.id === item.id ? item : entry);
      return [item, ...current];
    });
    setActionMessage(message);
    setActionError("");
  }
  async function handleToggleActive(item) {
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await pricingRuleService.updatePricingRule(item.id, {
        isActive: !item.isActive
      });
      setItems(
        (current) => current.map((entry) => entry.id === item.id ? response.item : entry)
      );
      setActionMessage(response.message || "C\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i th\xE0nh c\xF4ng.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }
  async function handleDelete(item) {
    const label = SHIPPING_SERVICE_TYPE_LABELS[item.shippingServiceType] || item.shippingServiceType;
    if (!window.confirm(`X\xF3a c\u1EA5u h\xECnh gi\xE1 "${label}" (${formatPricingRoute(item.route)})?`)) return;
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await pricingRuleService.deletePricingRule(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "\u0110\xE3 x\xF3a c\u1EA5u h\xECnh gi\xE1.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { activeNav: "pricing-rules", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-ink tracking-tight", children: "B\u1EA3ng gi\xE1 k\xFD g\u1EEDi" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mt-1 max-w-2xl", children: "C\u1EA5u h\xECnh gi\xE1 d\xF9ng cho b\xE1o gi\xE1 t\u1EA1m t\xEDnh v\xE0 b\xE1o gi\xE1 ch\u1ED1t khi Customer t\u1EA1o y\xEAu c\u1EA7u k\xFD g\u1EEDi." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: openCreate,
            className: "inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0",
            children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:plus", className: "w-4 h-4" }),
              "Th\xEAm c\u1EA5u h\xECnh gi\xE1"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(
            Icon,
            {
              icon: "lucide:search",
              className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "search",
              value: searchInput,
              onChange: (e) => setSearchInput(e.target.value),
              placeholder: "T\xECm theo lo\u1EA1i d\u1ECBch v\u1EE5 ho\u1EB7c tuy\u1EBFn v\u1EADn chuy\u1EC3n...",
              className: "w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium input-focus-ring lg:min-w-[200px]",
            children: STATUS_FILTER_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value || "all"))
          }
        )
      ] }),
      actionError ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: actionError }) : null,
      actionMessage ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: actionMessage }) : null,
      /* @__PURE__ */ jsx("div", { className: "bg-surface-elevated rounded-xl border border-border-muted shadow-sm overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1100px] text-left", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-muted bg-surface", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "D\u1ECBch v\u1EE5" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Lo\u1EA1i k\xFD g\u1EEDi" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Tuy\u1EBFn" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "\u0110\u01A1n v\u1ECB" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Gi\xE1/kg" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Gi\xE1/CBM" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Ph\xED DV" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Tr\u1EA1ng th\xE1i" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right", children: "H\xE0nh \u0111\u1ED9ng" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border-muted", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-5 h-5 animate-spin" }),
          "\u0110ang t\u1EA3i b\u1EA3ng gi\xE1..."
        ] }) }) }) : items.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "px-6 py-12 text-center text-sm text-muted", children: search || statusFilter ? "Kh\xF4ng t\xECm th\u1EA5y c\u1EA5u h\xECnh ph\xF9 h\u1EE3p." : 'Ch\u01B0a c\xF3 c\u1EA5u h\xECnh gi\xE1. Nh\u1EA5n "Th\xEAm c\u1EA5u h\xECnh gi\xE1" \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u.' }) }) : items.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-surface/80 transition-colors", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink", children: SHIPPING_SERVICE_TYPE_LABELS[item.shippingServiceType] || item.shippingServiceType }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-faint mt-0.5", children: item.id })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm text-muted", children: CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm text-muted", children: formatPricingRoute(item.route) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm text-muted", children: BILLING_UNIT_LABELS[item.billingUnit] || item.billingUnit }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm font-medium", children: formatMoney(item.pricePerKg) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm font-medium", children: formatMoney(item.pricePerCbm) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm font-medium", children: formatMoney(item.serviceFee) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx(ActiveBadge, { isActive: item.isActive }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => openEdit(item),
                disabled: pendingId === item.id,
                className: "p-2 text-muted hover:text-insight hover:bg-surface rounded-lg disabled:opacity-50",
                title: "S\u1EEDa",
                children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:pencil", className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleToggleActive(item),
                disabled: pendingId === item.id,
                className: "p-2 text-muted hover:text-warning-text hover:bg-surface rounded-lg disabled:opacity-50",
                title: item.isActive ? "V\xF4 hi\u1EC7u h\xF3a" : "K\xEDch ho\u1EA1t",
                children: /* @__PURE__ */ jsx(
                  Icon,
                  {
                    icon: item.isActive ? "lucide:ban" : "lucide:circle-check",
                    className: "w-4 h-4"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleDelete(item),
                disabled: pendingId === item.id,
                className: "p-2 text-muted hover:text-danger hover:bg-danger/5 rounded-lg disabled:opacity-50",
                title: "X\xF3a",
                children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:trash-2", className: "w-4 h-4" })
              }
            )
          ] }) })
        ] }, item.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      PricingRuleFormModal,
      {
        open: modalMode !== null,
        mode: modalMode === "edit" ? "edit" : "create",
        item: editingItem,
        onClose: closeModal,
        onSaved: handleSaved
      }
    )
  ] });
}
export {
  PricingRulesPage as default
};
