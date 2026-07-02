export class ApiError extends Error {
  constructor(status, body = {}) {
    super(
      body.message ||
        body.detail ||
        body.error ||
        body.title ||
        "Request failed"
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function parseApiError(response) {
  let body = {};

  try {
    body = await response.json();
  } catch {
    body = { message: response.statusText || "Request failed" };
  }

  if (!body.message && body.errors) {
    const messages = Object.entries(body.errors).flatMap(([field, msgs]) => {
      const list = Array.isArray(msgs) ? msgs : [msgs];
      return list.filter(Boolean).map((entry) => (field ? `${field}: ${entry}` : entry));
    });
    if (messages.length) {
      body.message = messages.join(" ");
    }
  }

  return new ApiError(response.status, body);
}

const NETWORK_ERROR_PATTERN = /failed to fetch|networkerror|load failed|network request failed/i;

export function getErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    if (NETWORK_ERROR_PATTERN.test(error.message)) {
      return "Không thể kết nối máy chủ. Kiểm tra API_URL trong .env.local và backend đang chạy.";
    }

    return error.message;
  }

  return fallback;
}
