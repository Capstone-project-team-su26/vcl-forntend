import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listConversationsApi,
  getConversationApi,
  createConversationApi,
  sendMessageApi,
  markConversationAsReadApi,
} from "./api";
import {
  listConversationsMock,
  getConversationMock,
  createConversationMock,
  sendMessageMock,
  markConversationAsReadMock,
} from "./mock";

export { dedupeConversations } from "./mappers";

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

export async function listConversations() {
  if (isMockMode()) return listConversationsMock();
  return listConversationsApi();
}

export async function getConversation(conversationId) {
  if (isMockMode()) return getConversationMock(conversationId);
  return getConversationApi(conversationId);
}

export async function createConversation(payload) {
  if (isMockMode()) return createConversationMock(payload);
  return createConversationApi(payload);
}

export async function sendMessage(conversationId, payload) {
  if (isMockMode()) return sendMessageMock(conversationId, payload);
  return sendMessageApi(conversationId, payload);
}

export async function markConversationAsRead(conversationId) {
  if (isMockMode()) return markConversationAsReadMock(conversationId);
  return markConversationAsReadApi(conversationId);
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
