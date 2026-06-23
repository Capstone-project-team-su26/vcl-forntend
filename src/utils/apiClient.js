import { getAccessToken, clearSession, getSession } from "@/utils/authSession";
import { ApiError, parseApiError } from "@/utils/apiError";
import { getForbiddenRedirect, buildLoginUrl } from "@/utils/routeAccess";

const FORBIDDEN_FLASH_KEY = "vcl_forbidden_flash";

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

  if (response.status === 403 && !skipAuth && typeof window !== "undefined") {
    const session = getSession();
    let message = "Bạn không có quyền thực hiện thao tác này.";

    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // response body không phải JSON
    }

    sessionStorage.setItem(
      FORBIDDEN_FLASH_KEY,
      JSON.stringify({ message, at: Date.now() })
    );
    window.location.replace(`${getForbiddenRedirect(session?.role)}?error=forbidden`);
    throw new ApiError(403, { message });
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
