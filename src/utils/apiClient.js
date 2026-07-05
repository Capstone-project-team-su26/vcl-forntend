import { getAccessToken, clearSession } from "@/utils/authSession";
import { ApiError, parseApiError } from "@/utils/apiError";
import { buildLoginUrl } from "@/utils/routeAccess";

/**
 * Dev: để trống → gọi `/api/*` qua proxy Next.js (đọc API_URL trong .env.local).
 * Production (không proxy): set NEXT_PUBLIC_API_BASE_URL=https://api.example.com
 */
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

/**
 * @param {string} path - e.g. /api/Auth/login
 * @param {RequestInit & { skipAuth?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...rest,
      headers,
    });
  } catch {
    throw new ApiError(0, {
      message:
        "Không thể kết nối máy chủ. Kiểm tra API_URL trong .env.local và backend đang chạy.",
    });
  }

  if (response.status === 401 && !skipAuth) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.replace(buildLoginUrl(window.location.pathname));
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

/**
 * Gọi API; nếu BE trả 404 (endpoint chưa triển khai), dùng mockFn tạm.
 * @param {string} path
 * @param {RequestInit & { skipAuth?: boolean }} options
 * @param {() => Promise<unknown>} mockFn
 */
export async function apiRequestWithMockFallback(path, options, mockFn) {
  try {
    return await apiRequest(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[api] ${path} → 404, dùng dữ liệu mock tạm`);
      }
      return mockFn();
    }
    throw err;
  }
}
