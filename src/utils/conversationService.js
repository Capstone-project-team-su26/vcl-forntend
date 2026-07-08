import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import { getSession } from "@/utils/authSession";
import { ApiError } from "@/utils/apiError";

export const CONVERSATION_RELATED_TYPE_LABELS = {
  GENERAL: "Trao đổi chung",
  CONSIGNMENT: "Ký gửi",
  PURCHASE_REQUEST: "Mua hộ",
  QUOTATION: "Báo giá",
};

export const CONVERSATION_STATUS_LABELS = {
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
};

function unwrapData(response) {
  return response?.data ?? response;
}

function normalizeSummary(item) {
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

function normalizeMessage(item) {
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

function normalizeDetail(item) {
  if (!item) return null;
  return {
    ...normalizeSummary(item),
    messages: (item.messages || []).map(normalizeMessage),
  };
}

function getMockCurrentUser() {
  const session = getSession();
  return {
    userId: session?.userId || "mock-sale-001",
    role: session?.role || "Sale",
    fullName: session?.fullName || session?.displayName || "Nguyen Van Sale",
  };
}

function buildMockSummary(conversation, messages, currentUserId) {
  const lastMessage = [...messages].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  return {
    id: conversation.id,
    customerId: conversation.customerId,
    customerName: conversation.customerName,
    salesId: conversation.salesId ?? null,
    salesName: conversation.salesName ?? null,
    relatedType: conversation.relatedType,
    relatedId: conversation.relatedId ?? null,
    status: conversation.status,
    lastMessagePreview: lastMessage?.content ?? null,
    unreadCount: messages.filter((m) => !m.isRead && m.senderId !== currentUserId).length,
    lastMessageAt: lastMessage?.createdAt ?? null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function mockGetConversations() {
  const store = getMockStore();
  const current = getMockCurrentUser();
  const list = (store.conversations || [])
    .filter((c) => !c.salesId || c.salesId === current.userId)
    .map((c) => buildMockSummary(c, c.messages || [], current.userId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return list;
}

function mockGetConversation(conversationId) {
  const store = getMockStore();
  const conversation = (store.conversations || []).find((c) => c.id === conversationId);
  if (!conversation) {
    throw new ApiError(404, { message: "Không tìm thấy cuộc trao đổi." });
  }

  const current = getMockCurrentUser();
  if (conversation.salesId && conversation.salesId !== current.userId) {
    throw new ApiError(403, { message: "Bạn không có quyền truy cập cuộc trao đổi này." });
  }

  return {
    ...buildMockSummary(conversation, conversation.messages || [], current.userId),
    messages: [...(conversation.messages || [])].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    ),
  };
}

function mockSendMessage(conversationId, payload) {
  const content = payload?.content?.trim();
  if (!content) {
    throw new ApiError(400, { message: "Nội dung tin nhắn không hợp lệ." });
  }

  const store = getMockStore();
  const conversation = (store.conversations || []).find((c) => c.id === conversationId);
  if (!conversation) {
    throw new ApiError(404, { message: "Không tìm thấy cuộc trao đổi." });
  }

  const current = getMockCurrentUser();
  if (conversation.salesId && conversation.salesId !== current.userId) {
    throw new ApiError(403, { message: "Bạn không có quyền truy cập cuộc trao đổi này." });
  }

  if (!conversation.salesId && current.role === "Sale") {
    conversation.salesId = current.userId;
    conversation.salesName = current.fullName;
  }

  const message = {
    id: nextMockId("msg"),
    conversationId,
    senderId: current.userId,
    senderRole: current.role,
    senderName: current.fullName,
    content,
    attachmentUrl: payload?.attachmentUrl ?? null,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  conversation.messages = [...(conversation.messages || []), message];
  conversation.updatedAt = message.createdAt;

  return message;
}

function mockMarkAsRead(conversationId) {
  const store = getMockStore();
  const conversation = (store.conversations || []).find((c) => c.id === conversationId);
  if (!conversation) {
    throw new ApiError(404, { message: "Không tìm thấy cuộc trao đổi." });
  }

  const current = getMockCurrentUser();
  const updatedIds = [];

  for (const message of conversation.messages || []) {
    if (message.senderId !== current.userId && !message.isRead) {
      message.isRead = true;
      updatedIds.push(message.id);
    }
  }

  return {
    conversationId,
    readerId: current.userId,
    readerRole: current.role,
    messageIds: updatedIds,
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

export async function listConversations() {
  if (isMockMode()) {
    await mockDelay();
    return mockGetConversations();
  }

  const response = await apiRequest("/api/conversations");
  return dedupeConversations((unwrapData(response) || []).map(normalizeSummary));
}

export async function getConversation(conversationId) {
  if (isMockMode()) {
    await mockDelay();
    return mockGetConversation(conversationId);
  }

  const response = await apiRequest(`/api/conversations/${conversationId}`);
  return normalizeDetail(unwrapData(response));
}

export async function createConversation(payload) {
  if (isMockMode()) {
    await mockDelay();
    throw new ApiError(403, { message: "Chỉ khách hàng mới được tạo cuộc trao đổi mới." });
  }

  const response = await apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeDetail(unwrapData(response));
}

export async function sendMessage(conversationId, payload) {
  if (isMockMode()) {
    await mockDelay(200);
    return normalizeMessage(mockSendMessage(conversationId, payload));
  }

  const response = await apiRequest(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeMessage(unwrapData(response));
}

export async function markConversationAsRead(conversationId) {
  if (isMockMode()) {
    await mockDelay(100);
    return mockMarkAsRead(conversationId);
  }

  const response = await apiRequest(`/api/conversations/${conversationId}/read`, {
    method: "PUT",
  });
  return unwrapData(response);
}

export function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
