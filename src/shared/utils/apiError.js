export class ApiError extends Error {
  constructor(status, body = {}) {
    super(body.message || body.error || "Request failed");
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

  return new ApiError(response.status, body);
}

export function getErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
