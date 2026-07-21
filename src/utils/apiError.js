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
/** Backend/proxy đôi khi chỉ trả "error code: 502" / statusText — không dùng được cho user. */
const CRYPTIC_ERROR_PATTERN =
  /^(error\s*code\s*:\s*\d+|bad gateway|gateway timeout|service unavailable|internal server error|request failed|\d{3})$/i;

const HTTP_STATUS_MESSAGES = {
  0: "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
  408: "Yêu cầu hết thời gian chờ. Vui lòng thử lại.",
  429: "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.",
  500: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  502: "Máy chủ hiện không phản hồi. Vui lòng thử lại sau ít phút.",
  503: "Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau.",
  504: "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau.",
};

function isCrypticMessage(message) {
  const text = String(message || "").trim();
  if (!text) return true;
  if (CRYPTIC_ERROR_PATTERN.test(text)) return true;
  if (/error\s*code\s*:\s*\d+/i.test(text)) return true;
  return false;
}

export function getErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  if (error instanceof ApiError) {
    const statusHint = HTTP_STATUS_MESSAGES[error.status];
    const msg = String(error.message || "").trim();
    if (statusHint && isCrypticMessage(msg)) return statusHint;
    return msg || statusHint || fallback;
  }

  if (error instanceof Error && error.message) {
    if (NETWORK_ERROR_PATTERN.test(error.message)) {
      return "Không thể kết nối máy chủ. Kiểm tra API_URL trong .env.local và backend đang chạy.";
    }
    if (isCrypticMessage(error.message)) {
      return fallback;
    }

    return error.message;
  }

  return fallback;
}
