/** Barrel export — import mock helpers từ `@/utils/mocks`. */
export {
  DataSource,
  getDataSource,
  getDataSourceLabel,
  isMockMode,
  setDataSourceOverride,
  DATA_SOURCE_CHANGE_EVENT,
} from "./dataSource";
export { mockDelay } from "./mockDelay";
export { getMockStore, nextMockId, resetMockStore } from "./mockStore";
export { MOCK_TEST_ACCOUNTS, resolveMockAccount } from "./mockAccounts";
export {
  mockLogin,
  mockForgotPassword,
  mockResetPassword,
  mockAdminRegisterEmployee,
} from "./authMocks";
