"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  formatConsignmentDate
} = orderConsignmentService;
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\xE1i" },
  { value: "PENDING_REVIEW", label: CONSIGNMENT_STATUS_LABELS.PENDING_REVIEW },
  { value: "IN_PROGRESS", label: CONSIGNMENT_STATUS_LABELS.IN_PROGRESS },
  { value: "IN_WAREHOUSE", label: CONSIGNMENT_STATUS_LABELS.IN_WAREHOUSE },
  { value: "CANCELLED", label: CONSIGNMENT_STATUS_LABELS.CANCELLED },
  { value: "APPROVED", label: CONSIGNMENT_STATUS_LABELS.APPROVED },
  { value: "REJECTED", label: CONSIGNMENT_STATUS_LABELS.REJECTED },
  { value: "COMPLETED", label: CONSIGNMENT_STATUS_LABELS.COMPLETED }
];
const PAGE_SIZE = 10;
function StatusBadge({ status }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block px-3 py-1 rounded-full text-[12px] font-bold ${CONSIGNMENT_STATUS_STYLES[status] || "bg-surface text-muted"}`,
      children: CONSIGNMENT_STATUS_LABELS[status] || status
    }
  );
}
function ConsignmentListPanel() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);
  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await orderConsignmentService.listStaffConsignments({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter || void 0,
          search: search || void 0
        });
        if (active) setData(response);
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
  }, [page, statusFilter, search]);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink", children: "Qu\u1EA3n l\xFD k\xFD g\u1EEDi" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted text-sm font-medium mt-2", children: [
        "Xem v\xE0 x\u1EED l\xFD y\xEAu c\u1EA7u k\xFD g\u1EEDi t\u1EEB kh\xE1ch h\xE0ng. \u01AFu ti\xEAn",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-warning-text font-bold", children: "ch\u1EDD duy\u1EC7t" }),
        "."
      ] })
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
            placeholder: "T\xECm theo m\xE3 y\xEAu c\u1EA7u ho\u1EB7c t\xEAn kh\xE1ch h\xE0ng...",
            className: "w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: "h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 lg:min-w-[200px]",
          children: STATUS_FILTER_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value || "all"))
        }
      )
    ] }),
    error ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
    /* @__PURE__ */ jsxs("div", { className: "bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-muted", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-extrabold font-['Oswald']", children: "Danh s\xE1ch y\xEAu c\u1EA7u" }),
        !isLoading && /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted font-medium", children: [
          totalCount,
          " y\xEAu c\u1EA7u"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-muted", children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "M\xE3 y\xEAu c\u1EA7u" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "T\xEAn kh\xE1ch h\xE0ng" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Lo\u1EA1i k\xFD g\u1EEDi" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Tr\u1EA1ng th\xE1i" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold", children: "Ng\xE0y t\u1EA1o" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-sm font-bold text-right", children: "Chi ti\u1EBFt" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border-muted", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:loader-2", className: "w-5 h-5 animate-spin" }),
          "\u0110ang t\u1EA3i danh s\xE1ch..."
        ] }) }) }) : items.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 6, className: "px-6 py-12 text-center", children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:inbox", className: "w-10 h-10 text-muted mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-ink", children: "Ch\u01B0a c\xF3 y\xEAu c\u1EA7u k\xFD g\u1EEDi n\xE0o" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mt-1", children: search || statusFilter ? "Th\u1EED \u0111\u1ED5i b\u1ED9 l\u1ECDc ho\u1EB7c t\u1EEB kh\xF3a t\xECm ki\u1EBFm." : "Y\xEAu c\u1EA7u m\u1EDBi t\u1EEB kh\xE1ch h\xE0ng s\u1EBD hi\u1EC3n th\u1ECB t\u1EA1i \u0111\xE2y." })
        ] }) }) : items.map((item) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-surface-muted transition-colors cursor-pointer",
            onClick: () => router.push(ROUTES.sales.consignment(item.id)),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-bold text-secondary", children: item.consignmentCode || `${item.id.slice(0, 8)}\u2026` }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium", children: item.customerName }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted", children: CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(StatusBadge, { status: item.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted", children: formatConsignmentDate(item.createdAt) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: ROUTES.sales.consignment(item.id),
                  onClick: (e) => e.stopPropagation(),
                  className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/30 text-secondary text-sm font-bold hover:bg-surface-muted transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(Icon, { icon: "lucide:eye", className: "w-4 h-4" }),
                    "Xem chi ti\u1EBFt"
                  ]
                }
              ) })
            ]
          },
          item.id
        )) })
      ] }) }),
      !isLoading && totalCount > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border-muted", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted", children: [
          "Trang ",
          page,
          " / ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              disabled: page <= 1,
              onClick: () => setPage((current) => Math.max(1, current - 1)),
              className: "inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted",
              children: [
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:chevron-left", className: "w-4 h-4" }),
                "Tr\u01B0\u1EDBc"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              disabled: page >= totalPages,
              onClick: () => setPage((current) => Math.min(totalPages, current + 1)),
              className: "inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted",
              children: [
                "Sau",
                /* @__PURE__ */ jsx(Icon, { icon: "lucide:chevron-right", className: "w-4 h-4" })
              ]
            }
          )
        ] })
      ] }) : null
    ] })
  ] });
}
export {
  ConsignmentListPanel as default
};
