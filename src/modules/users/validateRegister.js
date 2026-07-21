/** Email so trùng: trim + lowercase. */
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * SĐT so trùng: bỏ khoảng trắng/dấu; +84/84 → 0.
 * ponytail: đủ VN + số quốc tế dạng chữ số; không parse libphonenumber.
 */
export function normalizePhone(phone) {
  let raw = String(phone || "")
    .trim()
    .replace(/[\s().-]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) raw = raw.slice(1);
  if (raw.startsWith("84") && raw.length >= 11) raw = `0${raw.slice(2)}`;
  return raw;
}

export function findDuplicateUser(users, { email, phone }) {
  const emailNorm = normalizeEmail(email);
  const phoneNorm = normalizePhone(phone);

  for (const user of users || []) {
    if (emailNorm && normalizeEmail(user.email) === emailNorm) {
      return {
        field: "email",
        message: "Email đã được sử dụng bởi tài khoản khác.",
      };
    }
    if (phoneNorm && normalizePhone(user.phone) === phoneNorm) {
      return {
        field: "phone",
        message: "Số điện thoại đã được sử dụng bởi tài khoản khác.",
      };
    }
  }
  return null;
}

/**
 * @returns {Record<string, string>} lỗi theo tên field form (rỗng = hợp lệ)
 */
export function validateEmployeeRegister({
  fullName,
  email,
  password,
  phone,
  role,
  region,
  needsRegion,
  regionsLoading,
}) {
  const errors = {};

  const name = String(fullName || "").trim();
  if (!name) errors.fullName = "Nhập họ tên nhân viên.";
  else if (name.length < 2) errors.fullName = "Họ tên cần ít nhất 2 ký tự.";
  else if (name.length > 255) errors.fullName = "Họ tên tối đa 255 ký tự.";

  const emailNorm = normalizeEmail(email);
  if (!emailNorm) errors.email = "Nhập email đăng nhập.";
  else if (emailNorm.length > 255) errors.email = "Email tối đa 255 ký tự.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    errors.email = "Email không đúng định dạng.";
  }

  const phoneRaw = String(phone || "").trim();
  const phoneNorm = normalizePhone(phoneRaw);
  if (!phoneRaw) errors.phone = "Nhập số điện thoại liên hệ.";
  else if (phoneRaw.length > 50) errors.phone = "Số điện thoại tối đa 50 ký tự.";
  else if (!/^\d{8,15}$/.test(phoneNorm)) {
    errors.phone = "Số điện thoại không hợp lệ (8–15 chữ số).";
  }

  const pwd = String(password || "");
  if (!pwd) errors.password = "Nhập mật khẩu tạm cho nhân viên.";
  else if (pwd.length < 8) errors.password = "Mật khẩu cần ít nhất 8 ký tự.";
  else if (pwd.length > 100) errors.password = "Mật khẩu tối đa 100 ký tự.";

  if (!role) errors.employeeRole = "Chọn vai trò nhân viên.";

  if (needsRegion && !region) {
    errors.region = regionsLoading
      ? "Đang tải danh sách kho, thử lại sau giây lát."
      : "Chọn region kho cho tài khoản Warehouse.";
  }

  return errors;
}
