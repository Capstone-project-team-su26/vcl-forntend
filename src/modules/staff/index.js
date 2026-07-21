import { isMockMode } from "@/utils/mocks/dataSource";
import { getSalesWorkspaceApi } from "./api";
import { getSalesWorkspaceMock } from "./mock";

export async function getSalesWorkspace() {
  if (isMockMode()) return getSalesWorkspaceMock();
  return getSalesWorkspaceApi();
}
