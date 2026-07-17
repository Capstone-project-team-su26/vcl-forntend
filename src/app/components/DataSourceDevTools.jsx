"use client";

import { useEffect, useState } from "react";
import {
  DATA_SOURCE_CHANGE_EVENT,
  DataSource,
  getDataSource,
  getDataSourceLabel,
  setDataSourceOverride,
} from "@/utils/mocks/dataSource";
import styles from "./DataSourceDevTools.module.scss";

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
    const next = source === "mock" ? "api" : "mock";
    setDataSourceOverride(next);
    window.location.reload();
  }

  function resetOverride() {
    setDataSourceOverride(null);
    window.location.reload();
  }

  const isMock = source === DataSource.MOCK;

  return (
    <div className={styles.root}>
      <span className={styles.label}>Data:</span>
      <button
        type="button"
        onClick={toggle}
        className={`${styles.toggleBtn} ${isMock ? styles.mock : styles.api}`}
        title="Chuyển mock ↔ API (reload trang)"
      >
        {getDataSourceLabel()}
      </button>
      <button type="button" onClick={resetOverride} className={styles.resetBtn} title="Xóa ghi đè localStorage">
        Reset
      </button>
    </div>
  );
}
