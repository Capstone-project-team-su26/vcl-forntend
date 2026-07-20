import { isMockMode } from "@/utils/mocks/dataSource";
import { formatMoney } from "@/modules/service-pricing";
import { formatDateTimeLocal } from "@/utils/dateTime";
import { getOrderPaymentHistoryApi, listFlattenedPaymentHistoryApi } from "./api";
import { getOrderPaymentHistoryMock, listFlattenedPaymentHistoryMock } from "./mock";
import { normalizeOrderPaymentHistory, normalizePaymentStatus } from "./mappers";

export { normalizeOrderPaymentHistory } from "./mappers";

export const PAYMENT_STATUS_LABELS = {
  PENDING: "Chờ thanh toán",
  SUCCESS: "Thành công",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELED: "Đã hủy",
  CANCELLED: "Đã hủy",
};

export const PAYMENT_STATUS_STYLES = {
  PENDING: "bg-warning-bg text-warning-text",
  SUCCESS: "bg-success-bg text-success-text",
  PAID: "bg-success-bg text-success-text",
  FAILED: "bg-danger/10 text-danger",
  CANCELED: "bg-surface text-muted",
  CANCELLED: "bg-surface text-muted",
};

export const INSTALLMENT_TYPE_LABELS = {
  DEPOSIT: "Đặt cọc",
  FINAL: "Thanh toán cuối",
  FULL: "Thanh toán đủ",
};

function paymentSortKey(row) {
  const raw = row.paidAt || row.createdAt;
  const ms = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export async function getOrderPaymentHistory(orderId) {
  if (!orderId) {
    return normalizeOrderPaymentHistory({ payments: [] });
  }
  if (isMockMode()) return getOrderPaymentHistoryMock(orderId);
  return getOrderPaymentHistoryApi(orderId);
}

/**
 * Gom lịch sử thanh toán từ các đơn ký gửi gần đây.
 * BE chưa có list toàn cục — FE gọi history theo order (giới hạn + pool).
 */
export async function listFlattenedPaymentHistory(params = {}) {
  if (isMockMode()) {
    const payments = await listFlattenedPaymentHistoryMock();
    return payments.sort((a, b) => paymentSortKey(b) - paymentSortKey(a));
  }

  const payments = await listFlattenedPaymentHistoryApi(params);
  return payments.sort((a, b) => paymentSortKey(b) - paymentSortKey(a));
}

export function formatPaymentAmount(amount) {
  return formatMoney(amount);
}

export function formatPaymentDate(isoDate) {
  return formatDateTimeLocal(isoDate);
}

export function formatInstallmentType(type) {
  const key = String(type ?? "").toUpperCase();
  return INSTALLMENT_TYPE_LABELS[key] || type || "—";
}

export function formatPaymentStatus(status) {
  const key = normalizePaymentStatus(status);
  return PAYMENT_STATUS_LABELS[key] || status || "—";
}

// ponytail: self-check — normalize phải map PAID → SUCCESS
if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  const _sample = normalizeOrderPaymentHistory({
    orderId: "o1",
    consignmentCode: "C1",
    payments: [{ paymentId: "p1", amount: 1000, paymentStatus: "PAID", installmentType: "DEPOSIT" }],
  });
  console.assert(
    _sample.payments[0]?.status === "SUCCESS" && _sample.payments[0]?.amount === 1000,
    "normalizeOrderPaymentHistory mismatch"
  );
}
