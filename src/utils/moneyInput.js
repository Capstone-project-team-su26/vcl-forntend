/** Chuỗi chỉ gồm chữ số (VND nguyên) dùng làm state nội bộ. */
export function parseMoneyInput(value) {
  if (value == null || value === "") return "";
  return String(value).replace(/[^\d]/g, "");
}

/** Hiển thị nhóm nghìn kiểu vi-VN (VD: 1.500.000). */
export function formatMoneyInput(raw) {
  const digits = parseMoneyInput(raw);
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

export function toMoneyNumber(raw) {
  const digits = parseMoneyInput(raw);
  if (!digits) return 0;
  const numeric = Number(digits);
  return Number.isNaN(numeric) ? 0 : numeric;
}
