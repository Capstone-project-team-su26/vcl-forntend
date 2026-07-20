import { mockDelay } from "@/utils/mocks/mockDelay";
import { normalizeOrderPaymentHistory } from "./mappers";

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

export async function getOrderPaymentHistoryMock(orderId) {
  await mockDelay();
  const found = MOCK_HISTORIES.find((item) => item.orderId === orderId);
  return normalizeOrderPaymentHistory(found ?? { orderId, payments: [] });
}

export async function listFlattenedPaymentHistoryMock() {
  await mockDelay();
  return MOCK_HISTORIES.flatMap((history) =>
    normalizeOrderPaymentHistory(history).payments
  );
}
