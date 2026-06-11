import { getAccessToken, clearSession } from "@/shared/services/authSession";
import { parseApiError } from "@/shared/utils/apiError";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
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

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    clearSession();
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
