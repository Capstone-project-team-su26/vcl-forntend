import { apiRequest } from "@/utils/apiClient";
import { normalizeUserFromApi } from "./mappers";

export async function listUsersApi() {
  const raw = await apiRequest("/api/User");
  const users = Array.isArray(raw) ? raw : raw?.data ?? [];
  return users.map(normalizeUserFromApi);
}

export function lockUserApi(userId) {
  return apiRequest(`/api/User/${userId}/lock`, {
    method: "PUT",
  });
}

export function unlockUserApi(userId) {
  return apiRequest(`/api/User/${userId}/unlock`, {
    method: "PUT",
  });
}
