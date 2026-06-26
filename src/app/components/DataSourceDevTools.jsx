"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  DATA_SOURCE_CHANGE_EVENT,
  DataSource,
  getDataSource,
  getDataSourceLabel,
  setDataSourceOverride
} from "@/utils/mocks/dataSource";
function DataSourceDevTools() {
  const [source, setSource] = useState(
    () => getDataSource()
  );
  useEffect(() => {
    function handleChange() {
      setSource(getDataSource());
    }
    window.addEventListener(DATA_SOURCE_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(DATA_SOURCE_CHANGE_EVENT, handleChange);
  }, []);
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  function toggle() {
    const next = source === "mock" ? "api" : "mock";
    setDataSourceOverride(next);
    window.location.reload();
  }
  function resetOverride() {
    setDataSourceOverride(null);
    window.location.reload();
  }
  const isMock = source === DataSource.MOCK;
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 right-4 z-9999 flex items-center gap-2 rounded-lg border border-border-muted bg-white dark:bg-surface-elevated px-3 py-2 text-xs shadow-lg", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted", children: "Data:" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: toggle,
        className: `rounded px-2 py-1 font-semibold transition-colors ${isMock ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text"}`,
        title: "Chuy\u1EC3n mock \u2194 API (reload trang)",
        children: getDataSourceLabel()
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: resetOverride,
        className: "text-muted underline hover:text-ink",
        title: "X\xF3a ghi \u0111\xE8 localStorage, d\xF9ng NEXT_PUBLIC_DATA_SOURCE trong .env",
        children: "Reset"
      }
    )
  ] });
}
export {
  DataSourceDevTools as default
};
