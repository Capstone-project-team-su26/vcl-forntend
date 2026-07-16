const STORAGE_KEY = "vcl:dataSource";
const CHANGE_EVENT = "vcl:dataSource-changed";

export const DataSource = {
  MOCK: "mock",
  API: "api",
};

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function readEnvDefault() {
  if (isProductionRuntime()) {
    return DataSource.API;
  }

  const raw = process.env.NEXT_PUBLIC_DATA_SOURCE?.toLowerCase();
  if (raw === DataSource.MOCK || raw === DataSource.API) {
    return raw;
  }

  if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true") {
    return DataSource.MOCK;
  }

  return DataSource.API;
}

/** Nguồn dữ liệu hiện tại: `mock` hoặc `api`. Dev có thể ghi đè qua localStorage. */
export function getDataSource() {
  if (isProductionRuntime()) {
    return DataSource.API;
  }

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override === DataSource.MOCK || override === DataSource.API) {
      return override;
    }
  }

  return readEnvDefault();
}

export function isMockMode() {
  if (isProductionRuntime()) return false;
  return getDataSource() === DataSource.MOCK;
}

/**
 * Ghi đè nguồn dữ liệu khi dev (localStorage). Truyền `null` để xóa ghi đè, dùng lại .env.
 * @param {"mock" | "api" | null} mode
 */
export function setDataSourceOverride(mode) {
  if (typeof window === "undefined" || isProductionRuntime()) return;

  if (mode === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: getDataSource() }));
}

export function getDataSourceLabel() {
  return isMockMode() ? "Mock" : "API";
}

export { CHANGE_EVENT as DATA_SOURCE_CHANGE_EVENT };
