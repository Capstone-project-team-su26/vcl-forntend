import { getAccessToken } from "@/utils/authSession";
import { ApiError, parseApiError } from "@/utils/apiError";
import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function normalizeUploadUrls(raw) {
  if (raw == null) return [];
  if (typeof raw === "string" && /^https?:\/\//i.test(raw)) return [raw];

  const data = raw?.data ?? raw;
  const collected = [];

  const push = (value) => {
    if (typeof value === "string" && value.trim()) collected.push(value.trim());
  };

  if (Array.isArray(data?.urls)) data.urls.forEach(push);
  if (Array.isArray(raw?.urls)) raw.urls.forEach(push);
  if (Array.isArray(data)) {
    for (const entry of data) {
      if (typeof entry === "string") push(entry);
      else if (entry && typeof entry === "object") {
        push(entry.url ?? entry.secureUrl ?? entry.secure_url);
      }
    }
  }
  push(data?.url);
  push(data?.secureUrl);
  push(data?.secure_url);
  push(raw?.url);

  return [...new Set(collected)];
}

async function uploadImagesMock(files) {
  await mockDelay(200);
  return files.map((file) => URL.createObjectURL(file));
}

async function postMultipart(path, form) {
  const headers = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers,
      body: form,
    });
  } catch {
    throw new ApiError(0, { message: "Không thể upload ảnh. Kiểm tra kết nối máy chủ." });
  }

  if (!response.ok) throw await parseApiError(response);

  const text = await response.text();
  if (!text) return [];
  try {
    return normalizeUploadUrls(JSON.parse(text));
  } catch {
    if (/^https?:\/\//i.test(text.trim())) return [text.trim()];
    return [];
  }
}

/** Upload 1 ảnh qua POST /api/uploads/image (BE hiện có). */
export async function uploadImage(file) {
  if (!file) return null;
  if (isMockMode()) {
    const [url] = await uploadImagesMock([file]);
    return url;
  }

  const form = new FormData();
  form.append("file", file);
  const urls = await postMultipart("/api/uploads/image", form);
  return urls[0] ?? null;
}

/**
 * Upload nhiều ảnh → URL gắn vào items[].referenceUrls.
 * BE hiện tại chỉ chắc có `/api/uploads/image`; batch `/images` dùng khi có.
 * @param {File[]} files
 * @returns {Promise<string[]>}
 */
export async function uploadImages(files) {
  const list = (Array.isArray(files) ? files : []).filter(Boolean);
  if (!list.length) return [];
  if (isMockMode()) return uploadImagesMock(list);

  if (list.length > 1) {
    const batchForm = new FormData();
    for (const file of list) batchForm.append("files", file);
    try {
      const urls = await postMultipart("/api/uploads/images", batchForm);
      if (urls.length) return urls;
    } catch (err) {
      // 404/405 = BE chưa có batch → fallback single.
      if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 405)) {
        // Vẫn fallback single nếu batch lỗi khác (một số BE chỉ nhận field `file`).
      }
    }
  }

  const urls = [];
  const errors = [];
  for (const file of list) {
    try {
      const url = await uploadImage(file);
      if (url) urls.push(url);
      else errors.push(file.name || "ảnh");
    } catch (err) {
      errors.push(getUploadErrorLabel(err, file.name));
    }
  }

  if (!urls.length) {
    throw new ApiError(400, {
      message: errors[0] || "Upload ảnh thất bại. Không nhận được URL từ máy chủ.",
    });
  }
  return urls;
}

function getUploadErrorLabel(err, fileName) {
  const message =
    err instanceof ApiError
      ? err.message
      : err?.message || "Upload thất bại";
  return fileName ? `${fileName}: ${message}` : message;
}
