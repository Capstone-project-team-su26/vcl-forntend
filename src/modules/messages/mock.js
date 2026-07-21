import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { getSession } from "@/utils/authSession";
import { ApiError } from "@/utils/apiError";
import { normalizeConversationMessage } from "./mappers";

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

export async function listConversationsMock() {
  await mockDelay();
  const store = getMockStore();
  const current = getMockCurrentUser();
  return (store.conversations || [])
    .filter((c) => !c.salesId || c.salesId === current.userId)
    .map((c) => buildMockSummary(c, c.messages || [], current.userId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getConversationMock(conversationId) {
  await mockDelay();
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

export async function createConversationMock() {
  await mockDelay();
  throw new ApiError(403, { message: "Chỉ khách hàng mới được tạo cuộc trao đổi mới." });
}

export async function sendMessageMock(conversationId, payload) {
  await mockDelay(200);
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

  return normalizeConversationMessage(message);
}

export async function markConversationAsReadMock(conversationId) {
  await mockDelay(100);
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
