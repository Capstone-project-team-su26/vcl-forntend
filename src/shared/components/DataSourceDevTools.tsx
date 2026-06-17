"use client";

import { useEffect, useState } from "react";
import {
  DATA_SOURCE_CHANGE_EVENT,
  DataSource,
  getDataSource,
  getDataSourceLabel,
  setDataSourceOverride,
} from "@/shared/config/dataSource";

export default function DataSourceDevTools() {
  const [source, setSource] = useState(() => getDataSource());

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
    const next = source === DataSource.MOCK ? DataSource.API : DataSource.MOCK;
    setDataSourceOverride(next);
    window.location.reload();
  }

  function resetOverride() {
    setDataSourceOverride(null);
    window.location.reload();
  }

  const isMock = source === DataSource.MOCK;

  return (
    <div className="fixed bottom-4 right-4 z-9999 flex items-center gap-2 rounded-lg border border-surface-muted bg-white px-3 py-2 text-xs shadow-lg">
      <span className="text-muted">Data:</span>
      <button
        type="button"
        onClick={toggle}
        className={`rounded px-2 py-1 font-semibold transition-colors ${
          isMock ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text"
        }`}
        title="Chuyển mock ↔ API (reload trang)"
      >
        {getDataSourceLabel()}
      </button>
      <button
        type="button"
        onClick={resetOverride}
        className="text-muted underline hover:text-ink"
        title="Xóa ghi đè localStorage, dùng NEXT_PUBLIC_DATA_SOURCE trong .env"
      >
        Reset
      </button>
    </div>
  );
}
