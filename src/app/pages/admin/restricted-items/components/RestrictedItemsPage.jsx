"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import RestrictedItemFormModal from "./RestrictedItemFormModal";
import * as restrictedItemService from "@/utils/restrictedItemService";
import { getErrorMessage } from "@/utils/apiError";
const { RESTRICTION_TYPE_LABELS, formatRestrictedCountry } = restrictedItemService;
const TYPE_FILTER_OPTIONS = [
  { value: "", label: "T\u1EA5t c\u1EA3 lo\u1EA1i h\u1EA1n ch\u1EBF" },
  ...Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))
];
function RestrictionTypeBadge({ type }) {
  const styles = {
    PROHIBITED: "bg-danger/10 text-danger",
    RESTRICTED: "bg-warning-bg text-warning-text",
    CONDITIONAL: "bg-info-bg text-info-text"
  };
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block px-3 py-1 rounded-full text-[11px] font-bold ${styles[type] || "bg-surface text-muted"}`,
      children: RESTRICTION_TYPE_LABELS[type] || type
    }
  );
}
function ActiveBadge({ isActive }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block px-3 py-1 rounded-full text-[11px] font-bold ${isActive ? "bg-success-bg text-success-text" : "bg-surface text-muted"}`,
      children: isActive ? "Ho\u1EA1t \u0111\u1ED9ng" : "V\xF4 hi\u1EC7u"
    }
  );
}
function RestrictedItemsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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
        const data = await restrictedItemService.listRestrictedItems({
          search: search || void 0,
          restrictionType: typeFilter || void 0
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
  }, [search, typeFilter]);
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
      if (exists) {
        return current.map((entry) => entry.id === item.id ? item : entry);
      }
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
      const response = await restrictedItemService.updateRestrictedItem(item.id, {
        isActive: !item.isActive
      });
      setItems(
        (current) => current.map((entry) => entry.id === item.id ? response.item : entry)
      );
      setActionMessage(
        response.message || (response.item.isActive ? "\u0110\xE3 k\xEDch ho\u1EA1t m\u1EB7t h\xE0ng." : "\u0110\xE3 v\xF4 hi\u1EC7u h\xF3a m\u1EB7t h\xE0ng.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }
  async function handleDelete(item) {
    const confirmed = window.confirm(
      `X\xF3a "${item.name}" kh\u1ECFi danh m\u1EE5c? H\xE0nh \u0111\u1ED9ng n\xE0y kh\xF4ng th\u1EC3 ho\xE0n t\xE1c.`
    );
    if (!confirmed) return;
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await restrictedItemService.deleteRestrictedItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "\u0110\xE3 x\xF3a m\u1EB7t h\xE0ng.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { activeNav: "restricted-items", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-ink tracking-tight", children: "H\xE0ng c\u1EA5m / h\u1EA1n ch\u1EBF" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mt-1 max-w-2xl", children: "Qu\u1EA3n l\xFD danh m\u1EE5c d\xF9ng \u0111\u1EC3 ki\u1EC3m tra h\xE0ng h\xF3a khi Customer t\u1EA1o y\xEAu c\u1EA7u k\xFD g\u1EEDi." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: openCreate,
            className: "inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0",
            children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:plus", className: "w-4 h-4" }),
              "Th\xEAm m\u1EB7t h\xE0ng"
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
              placeholder: "T\xECm theo t\xEAn m\u1EB7t h\xE0ng...",
              className: "w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: typeFilter,
            onChange: (e) => setTypeFilter(e.target.value),
            className: "h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium input-focus-ring lg:min-w-[220px]",
            children: TYPE_FILTER_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value || "all"))
          }
        )
      ] }),
      actionError ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: actionError }) : null,
      actionMessage ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: actionMessage }) : null,
      /* @__PURE__ */ jsx("div", { className: "bg-surface-elevated rounded-xl border border-border-muted shadow-sm overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-muted bg-surface", children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "T\xEAn m\u1EB7t h\xE0ng" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Qu\u1ED1c gia" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Lo\u1EA1i h\u1EA1n ch\u1EBF" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Ghi ch\xFA" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Tr\u1EA1ng th\xE1i" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right", children: "H\xE0nh \u0111\u1ED9ng" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border-muted", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-5 h-5 animate-spin" }),
          "\u0110ang t\u1EA3i danh m\u1EE5c..."
        ] }) }) }) : items.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-sm text-muted", children: search || typeFilter ? "Kh\xF4ng t\xECm th\u1EA5y m\u1EB7t h\xE0ng ph\xF9 h\u1EE3p." : 'Ch\u01B0a c\xF3 m\u1EB7t h\xE0ng n\xE0o. Nh\u1EA5n "Th\xEAm m\u1EB7t h\xE0ng" \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u.' }) }) : items.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-surface/80 transition-colors", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink", children: item.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-faint mt-0.5", children: item.id })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted", children: formatRestrictedCountry(item.country) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(RestrictionTypeBadge, { type: item.restrictionType }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted max-w-xs truncate", title: item.notes, children: item.notes || "\u2014" }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(ActiveBadge, { isActive: item.isActive }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
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
      RestrictedItemFormModal,
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
  RestrictedItemsPage as default
};
