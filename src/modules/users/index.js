import { isMockMode } from "@/utils/mocks/dataSource";
import { listUsersApi, lockUserApi, unlockUserApi } from "./api";
import { listUsersMock, lockUserMock, unlockUserMock } from "./mock";

export { normalizeUserFromApi, normalizeEmployeeRole } from "./mappers";

export async function listUsers() {
  if (isMockMode()) return listUsersMock();
  return listUsersApi();
}

export function lockUser(userId) {
  if (isMockMode()) return lockUserMock(userId);
  return lockUserApi(userId);
}

export function unlockUser(userId) {
  if (isMockMode()) return unlockUserMock(userId);
  return unlockUserApi(userId);
}
