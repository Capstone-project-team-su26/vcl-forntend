import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { apiRequest } from "@/utils/apiClient";
import { listConsignments } from "@/utils/orderConsignmentService";
import { formatMoney } from "@/utils/servicePricingService";

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

/** Trạng thái đơn có khả năng đã phát sinh thanh toán — giảm N+1. */
const LIKELY_PAID_ORDER_STATUSES = new Set([
  "WAITING_DEPOSIT",
  "WAITING_PAYMENT",
  "DEPOSIT_PAID",
  "WAITING_FINAL_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PAID",
  "APPROVED",
  "IN_PROGRESS",
  "IN_WAREHOUSE",
  "WAREHOUSE_RECEIVED",
  "COMPLETED",
]);

function normalizePaymentStatus(raw) {
  const key = String(raw ?? "").trim().toUpperCase();
  if (key === "PAID") return "SUCCESS";
  if (key === "CANCELLED") return "CANCELED";
  return key || "PENDING";
}

function normalizePaymentLine(payment, context = {}) {
  if (!payment) return null;
  const status = normalizePaymentStatus(payment.status ?? payment.paymentStatus);
  const amount = Number(payment.amount) || 0;

  return {
    id: payment.paymentId ?? payment.id,
    paymentId: payment.paymentId ?? payment.id,
    invoiceId: payment.invoiceId ?? null,
    installmentType: String(payment.installmentType ?? "").toUpperCase() || null,
    amount,
    paymentMethod: payment.paymentMethod ?? null,
    status,
    orderCode: payment.orderCode ?? null,
    transactionCode: payment.transactionCode ?? null,
    checkoutUrl: payment.checkoutUrl ?? null,
    createdAt: payment.createdAt ?? null,
    paidAt: payment.paidAt ?? null,
    failureReason: payment.failureReason ?? null,
    orderId: context.orderId ?? null,
    consignmentCode: context.consignmentCode ?? null,
    orderStatus: context.orderStatus ?? null,
    customerName: context.customerName ?? null,
    customerCode: context.customerCode ?? null,
    customerId: context.customerId ?? null,
    totalBillAmount: context.totalBillAmount ?? null,
    totalPaid: context.totalPaid ?? null,
    remaining: context.remaining ?? null,
  };
}

export function normalizeOrderPaymentHistory(raw) {
  const data = raw?.data ?? raw;
  if (!data) {
    return {
      orderId: null,
      consignmentCode: null,
      orderStatus: null,
      customer: null,
      quotation: null,
      totalBillAmount: 0,
      totalPaid: 0,
      remaining: 0,
      payments: [],
    };
  }

  const customer = data.customer
    ? {
        customerId: data.customer.customerId ?? data.customer.id ?? null,
        fullName: data.customer.fullName ?? data.customer.name ?? "—",
        customerCode: data.customer.customerCode ?? null,
        email: data.customer.email ?? null,
        phone: data.customer.phone ?? null,
      }
    : null;

  const context = {
    orderId: data.orderId ?? null,
    consignmentCode: data.consignmentCode ?? null,
    orderStatus: data.orderStatus ?? null,
    customerName: customer?.fullName ?? null,
    customerCode: customer?.customerCode ?? null,
    customerId: customer?.customerId ?? null,
    totalBillAmount: Number(data.totalBillAmount) || 0,
    totalPaid: Number(data.totalPaid) || 0,
    remaining: Number(data.remaining) || 0,
  };

  const payments = (data.payments ?? [])
    .map((payment) => normalizePaymentLine(payment, context))
    .filter(Boolean);

  return {
    orderId: context.orderId,
    consignmentCode: context.consignmentCode,
    orderStatus: context.orderStatus,
    customer,
    quotation: data.quotation
      ? {
          quotationId: data.quotation.quotationId ?? null,
          quoteType: data.quotation.quoteType ?? null,
          status: data.quotation.status ?? null,
          totalAmount: Number(data.quotation.totalAmount) || 0,
        }
      : null,
    totalBillAmount: context.totalBillAmount,
    totalPaid: context.totalPaid,
    remaining: context.remaining,
    payments,
  };
}

const MOCK_HISTORIES = [
  {
    orderId: "ORD-PAY-001",
    consignmentCode: "VCL-MOCK-PAY-001",
    orderStatus: "APPROVED",
    customer: {
      customerId: "CUS-001",
      fullName: "Nguyễn Văn A",
      customerCode: "CUS-001",
      email: "a@example.com",
      phone: "0900000001",
    },
    quotation: {
      quotationId: "Q-001",
      quoteType: "OFFICIAL",
      status: "ACCEPTED",
      totalAmount: 500000,
    },
    totalBillAmount: 500000,
    totalPaid: 250000,
    remaining: 250000,
    payments: [
      {
        paymentId: "PAY-001",
        invoiceId: "INV-001",
        installmentType: "DEPOSIT",
        amount: 250000,
        paymentMethod: "PAYOS",
        status: "SUCCESS",
        orderCode: 2601010001,
        transactionCode: "FT-MOCK-001",
        checkoutUrl: null,
        createdAt: "2026-07-10T08:00:00Z",
        paidAt: "2026-07-10T08:05:00Z",
        failureReason: null,
      },
    ],
  },
  {
    orderId: "ORD-PAY-002",
    consignmentCode: "VCL-MOCK-PAY-002",
    orderStatus: "WAITING_DEPOSIT",
    customer: {
      customerId: "CUS-002",
      fullName: "Trần Thị B",
      customerCode: "CUS-002",
      email: "b@example.com",
      phone: "0900000002",
    },
    quotation: {
      quotationId: "Q-002",
      quoteType: "OFFICIAL",
      status: "ACCEPTED",
      totalAmount: 320000,
    },
    totalBillAmount: 320000,
    totalPaid: 0,
    remaining: 320000,
    payments: [
      {
        paymentId: "PAY-002",
        invoiceId: "INV-002",
        installmentType: "DEPOSIT",
        amount: 160000,
        paymentMethod: "PAYOS",
        status: "PENDING",
        orderCode: 2601010002,
        transactionCode: null,
        checkoutUrl: "https://pay.payos.vn/web/mock",
        createdAt: "2026-07-12T10:00:00Z",
        paidAt: null,
        failureReason: null,
      },
    ],
  },
];

async function getOrderPaymentHistoryMock(orderId) {
  await mockDelay();
  const found = MOCK_HISTORIES.find((item) => item.orderId === orderId);
  return normalizeOrderPaymentHistory(found ?? { orderId, payments: [] });
}

export async function getOrderPaymentHistory(orderId) {
  if (!orderId) {
    return normalizeOrderPaymentHistory({ payments: [] });
  }
  if (isMockMode()) return getOrderPaymentHistoryMock(orderId);

  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/payments/history`
  );
  return normalizeOrderPaymentHistory(raw);
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function paymentSortKey(row) {
  const raw = row.paidAt || row.createdAt;
  const ms = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Gom lịch sử thanh toán từ các đơn ký gửi gần đây.
 * BE chưa có list toàn cục — FE gọi history theo order (giới hạn + pool).
 */
export async function listFlattenedPaymentHistory({
  orderPageSize = 60,
  concurrency = 5,
} = {}) {
  if (isMockMode()) {
    await mockDelay();
    return MOCK_HISTORIES.flatMap((history) =>
      normalizeOrderPaymentHistory(history).payments
    ).sort((a, b) => paymentSortKey(b) - paymentSortKey(a));
  }

  const list = await listConsignments({ page: 1, pageSize: orderPageSize });
  const orders = (list?.items ?? []).filter((order) => {
    const status = String(order.status ?? "").toUpperCase();
    return LIKELY_PAID_ORDER_STATUSES.has(status);
  });

  const histories = await mapPool(orders, concurrency, async (order) => {
    const orderId = order.id ?? order.orderId;
    try {
      return await getOrderPaymentHistory(orderId);
    } catch {
      return null;
    }
  });

  return histories
    .filter(Boolean)
    .flatMap((history) => history.payments)
    .sort((a, b) => paymentSortKey(b) - paymentSortKey(a));
}

export function formatPaymentAmount(amount) {
  return formatMoney(amount);
}

export function formatPaymentDate(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
