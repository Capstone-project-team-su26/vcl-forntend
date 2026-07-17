export const purchaseOrders = [
  {
    id: "PO-PR-2024-007",
    purchaseOrderCode: "PO-PR-2024-007",
    purchaseRequestId: "PR-2024-007",
    requestCode: "PR-2024-007",
    customerId: "CUS-002",
    customerName: "Tran Thi B",
    status: "ORDER_PLACED",
    processingNote: "Đã đặt hàng với Apple Business, chờ NCC xác nhận.",
    supplier: "Apple Store Online US",
    purchaseNote: "Đặt hàng qua tài khoản corporate, giao về kho LA.",
    createdAt: "2024-10-24T16:00:00Z",
    items: [
      {
        id: "PRI-007-1",
        productName: "MacBook Pro 14 M3",
        productLink: "https://shop.example.com/macbook-pro-14",
        quantity: 1,
        attributes: "18GB RAM, 512GB SSD, Space Gray",
      },
    ],
  },
  {
    id: "PO-PR-2024-008",
    purchaseOrderCode: "PO-PR-2024-008",
    purchaseRequestId: "PR-2024-008",
    requestCode: "PR-2024-008",
    customerId: "CUS-001",
    customerName: "Nguyen Van A",
    status: "WAITING_WAREHOUSE_RECEIVE",
    processingNote: "NCC đã giao hàng về kho LA. Chờ Ops tạo phiếu nhập kho.",
    supplier: "Best Buy US",
    purchaseNote: null,
    createdAt: "2024-10-23T14:00:00Z",
    items: [
      {
        id: "PRI-008-1",
        productName: "iPad Pro 12.9",
        productLink: "https://shop.example.com/ipad-pro-129",
        quantity: 2,
        attributes: "256GB Wi-Fi",
      },
    ],
  },
];

