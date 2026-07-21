import { normalizeEmail, normalizePhone } from "@/modules/users/validateRegister";

/** Tài khoản auth thuộc khách (userType/role Customer). */
export function isCustomerAccount(user) {
  const type = String(user?.userType || "").toLowerCase();
  const role = String(user?.role || "").toLowerCase();
  return type === "customer" || role === "customer";
}

/**
 * Ghép hồ sơ ↔ TK đăng nhập.
 * ponytail: BE swagger chưa expose userId trên CustomerDto — khớp email rồi mới tới SĐT.
 */
export function findLinkedCustomerAccount(customer, users) {
  const accounts = (users || []).filter(isCustomerAccount);
  const email = normalizeEmail(customer?.email);
  const phone = normalizePhone(customer?.phone);

  if (email) {
    const byEmail = accounts.find((user) => normalizeEmail(user.email) === email);
    if (byEmail) return { user: byEmail, matchBy: "email" };
  }
  if (phone) {
    const byPhone = accounts.find((user) => normalizePhone(user.phone) === phone);
    if (byPhone) return { user: byPhone, matchBy: "phone" };
  }
  return null;
}

export function findLinkedCustomerProfile(user, customers) {
  if (!isCustomerAccount(user)) return null;

  const email = normalizeEmail(user?.email);
  const phone = normalizePhone(user?.phone);

  if (email) {
    const byEmail = (customers || []).find(
      (customer) => normalizeEmail(customer.email) === email
    );
    if (byEmail) return { customer: byEmail, matchBy: "email" };
  }
  if (phone) {
    const byPhone = (customers || []).find(
      (customer) => normalizePhone(customer.phone) === phone
    );
    if (byPhone) return { customer: byPhone, matchBy: "phone" };
  }
  return null;
}
