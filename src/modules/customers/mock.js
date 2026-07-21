import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

function normalizePhone(phone) {
  return phone?.replace(/\s+/g, "") ?? "";
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

function findDuplicateCustomer({ phone, email, excludeId }) {
  const store = getMockStore();
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedPhone) {
    const phoneDuplicate = store.customers.find(
      (item) =>
        item.id !== excludeId && normalizePhone(item.phone) === normalizedPhone
    );
    if (phoneDuplicate) {
      return { field: "phone", message: "Số điện thoại đã được sử dụng cho khách hàng khác." };
    }
  }

  if (normalizedEmail) {
    const emailDuplicate = store.customers.find(
      (item) =>
        item.id !== excludeId && normalizeEmail(item.email) === normalizedEmail
    );
    if (emailDuplicate) {
      return { field: "email", message: "Email đã được sử dụng cho khách hàng khác." };
    }
  }

  return null;
}

function filterCustomers(items, search) {
  if (!search) return items.map((item) => ({ ...item }));

  const query = search.toLowerCase();
  return items
    .filter((item) => {
      const haystack = [
        item.customerCode,
        item.id,
        item.fullName,
        item.email,
        item.phone,
        item.address,
        item.companyName,
        item.taxId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .map((item) => ({ ...item }));
}

function validateCustomerPayload(payload, { requireAll = false, excludeId } = {}) {
  const fullName = payload.fullName?.trim();
  const phone = payload.phone?.trim();
  const email = payload.email?.trim() || null;

  if (requireAll || payload.fullName !== undefined) {
    if (!fullName) throw new ApiError(400, { message: "Vui lòng nhập họ tên khách hàng." });
  }

  if (requireAll || payload.phone !== undefined) {
    if (!phone) throw new ApiError(400, { message: "Vui lòng nhập số điện thoại." });
  }

  const duplicate = findDuplicateCustomer({ phone, email, excludeId });
  if (duplicate) {
    throw new ApiError(400, { message: duplicate.message });
  }

  return {
    fullName,
    phone,
    email,
    address: payload.address?.trim() || null,
    companyName: payload.companyName?.trim() || null,
    taxId: payload.taxId?.trim() || null,
    status: payload.status || "ACTIVE",
  };
}

export async function listCustomersMock({ search } = {}) {
  await mockDelay();
  return filterCustomers(getMockStore().customers, search?.trim());
}

export async function getCustomerMock(id) {
  await mockDelay();
  const customer = getMockStore().customers.find((item) => item.id === id);
  if (!customer) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }
  return { ...customer };
}

export async function createCustomerMock(payload) {
  await mockDelay();

  const data = validateCustomerPayload(payload, { requireAll: true });
  const id = nextMockId("CUS");

  const item = {
    id,
    customerCode: id,
    ...data,
  };

  getMockStore().customers.unshift(item);
  return { message: "Tạo hồ sơ khách hàng thành công.", customer: { ...item } };
}

export async function updateCustomerMock(id, payload) {
  await mockDelay();

  const item = getMockStore().customers.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }

  const data = validateCustomerPayload({ ...item, ...payload }, { excludeId: id });
  Object.assign(item, data);

  return { message: "Cập nhật hồ sơ khách hàng thành công.", customer: { ...item } };
}
