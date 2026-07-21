function unwrapData(response) {
  return response?.data ?? response;
}

const JUNK_URLS = new Set(["string", "null", "undefined", "none", "n/a", "-"]);

function firstString(...candidates) {
  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (JUNK_URLS.has(trimmed.toLowerCase())) continue;
    return trimmed;
  }
  return null;
}

/** Chuẩn hóa URL media (relative → absolute API, base64 thô → data URI). */
export function resolveMediaUrl(url) {
  const raw = firstString(url);
  if (!raw) return null;

  if (/^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;

  // Base64 thô (client đôi khi gửi không có prefix)
  if (raw.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(raw) && !raw.includes("://")) {
    const compact = raw.replace(/\s+/g, "");
    return `data:image/jpeg;base64,${compact}`;
  }

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ""
  ).replace(/\/$/, "");

  if (raw.startsWith("/")) {
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  // path không có slash đầu (uploads/xxx.jpg)
  if (apiBase && !raw.includes("://")) {
    return `${apiBase}/${raw.replace(/^\.\//, "")}`;
  }

  return raw;
}

function pickAttachmentUrl(item) {
  if (!item || typeof item !== "object") return null;

  const fromList = Array.isArray(item.attachments)
    ? item.attachments[0]?.url ??
      item.attachments[0]?.Url ??
      item.attachments[0]?.attachmentUrl
    : null;
  const fromUrls = Array.isArray(item.attachmentUrls)
    ? item.attachmentUrls[0]
    : Array.isArray(item.AttachmentUrls)
      ? item.AttachmentUrls[0]
      : null;

  return resolveMediaUrl(
    firstString(
      item.attachmentUrl,
      item.AttachmentUrl,
      item.fileUrl,
      item.FileUrl,
      item.imageUrl,
      item.ImageUrl,
      item.mediaUrl,
      item.MediaUrl,
      item.attachment?.url,
      item.Attachment?.Url,
      fromList,
      fromUrls
    )
  );
}

export function normalizeConversationSummary(item) {
  if (!item) return null;
  return {
    id: item.id ?? item.Id,
    customerId: item.customerId ?? item.CustomerId,
    customerName: item.customerName ?? item.CustomerName,
    salesId: item.salesId ?? item.SalesId ?? null,
    salesName: item.salesName ?? item.SalesName ?? null,
    relatedType: item.relatedType ?? item.RelatedType,
    relatedId: item.relatedId ?? item.RelatedId ?? null,
    status: item.status ?? item.Status,
    lastMessagePreview: item.lastMessagePreview ?? item.LastMessagePreview ?? null,
    unreadCount: item.unreadCount ?? item.UnreadCount ?? 0,
    lastMessageAt: item.lastMessageAt ?? item.LastMessageAt ?? null,
    createdAt: item.createdAt ?? item.CreatedAt,
    updatedAt: item.updatedAt ?? item.UpdatedAt,
  };
}

export function normalizeConversationMessage(item) {
  if (!item) return null;

  const contentRaw = item.content ?? item.Content ?? "";
  const content = typeof contentRaw === "string" ? contentRaw : String(contentRaw ?? "");
  // Nội dung placeholder kiểu Swagger ("string") → coi như rỗng nếu có ảnh
  const attachmentUrl = pickAttachmentUrl(item);
  const cleanedContent =
    attachmentUrl && content.trim().toLowerCase() === "string" ? "" : content;

  return {
    id: item.id ?? item.Id,
    conversationId: item.conversationId ?? item.ConversationId,
    senderId: item.senderId ?? item.SenderId,
    senderRole: item.senderRole ?? item.SenderRole,
    senderName: item.senderName ?? item.SenderName,
    content: cleanedContent,
    attachmentUrl,
    isRead: Boolean(item.isRead ?? item.IsRead),
    createdAt: item.createdAt ?? item.CreatedAt,
  };
}

export function normalizeConversationDetail(item) {
  if (!item) return null;
  const messages = item.messages ?? item.Messages ?? [];
  return {
    ...normalizeConversationSummary(item),
    messages: messages.map(normalizeConversationMessage).filter(Boolean),
  };
}

export function dedupeConversations(items) {
  const map = new Map();

  for (const item of items) {
    const key = `${item.customerId}:${item.relatedType}:${item.relatedId ?? "none"}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      continue;
    }

    const existingTime = new Date(existing.lastMessageAt || existing.updatedAt).getTime();
    const itemTime = new Date(item.lastMessageAt || item.updatedAt).getTime();
    if (itemTime >= existingTime) {
      map.set(key, item);
    }
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt).getTime() -
      new Date(a.lastMessageAt || a.updatedAt).getTime()
  );
}

export { unwrapData };
