function unwrapData(response) {
  return response?.data ?? response;
}

export function normalizeConversationSummary(item) {
  if (!item) return null;
  return {
    id: item.id,
    customerId: item.customerId,
    customerName: item.customerName,
    salesId: item.salesId ?? null,
    salesName: item.salesName ?? null,
    relatedType: item.relatedType,
    relatedId: item.relatedId ?? null,
    status: item.status,
    lastMessagePreview: item.lastMessagePreview ?? null,
    unreadCount: item.unreadCount ?? 0,
    lastMessageAt: item.lastMessageAt ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function normalizeConversationMessage(item) {
  if (!item) return null;
  return {
    id: item.id,
    conversationId: item.conversationId,
    senderId: item.senderId,
    senderRole: item.senderRole,
    senderName: item.senderName,
    content: item.content,
    attachmentUrl: item.attachmentUrl ?? null,
    isRead: Boolean(item.isRead),
    createdAt: item.createdAt,
  };
}

export function normalizeConversationDetail(item) {
  if (!item) return null;
  return {
    ...normalizeConversationSummary(item),
    messages: (item.messages || []).map(normalizeConversationMessage),
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
