import { apiRequest } from "@/utils/apiClient";
import {
  unwrapData,
  normalizeConversationSummary,
  normalizeConversationMessage,
  normalizeConversationDetail,
  dedupeConversations,
} from "./mappers";

export async function listConversationsApi() {
  const response = await apiRequest("/api/conversations");
  return dedupeConversations((unwrapData(response) || []).map(normalizeConversationSummary));
}

export async function getConversationApi(conversationId) {
  const response = await apiRequest(`/api/conversations/${conversationId}`);
  return normalizeConversationDetail(unwrapData(response));
}

export async function createConversationApi(payload) {
  const response = await apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeConversationDetail(unwrapData(response));
}

export async function sendMessageApi(conversationId, payload) {
  const response = await apiRequest(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeConversationMessage(unwrapData(response));
}

export async function markConversationAsReadApi(conversationId) {
  const response = await apiRequest(`/api/conversations/${conversationId}/read`, {
    method: "PUT",
  });
  return unwrapData(response);
}
