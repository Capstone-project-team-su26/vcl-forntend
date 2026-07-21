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

export { normalizePaymentStatus };
