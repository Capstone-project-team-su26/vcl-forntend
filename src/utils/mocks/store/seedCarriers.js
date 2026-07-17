export const carriers = [
  {
    id: "CR-VCL",
    code: "VCL",
    name: "VCL Logistics",
    type: "FORWARDER",
    supportedShippingMethods: [
      "EXPRESS",
      "STANDARD",
      "ECONOMY",
    ],
    supportedRegions: "US, EU, CN, VN, JP, KR",
    contactInfo: "ops@vcl-logistics.com | +84 28 1234 5678",
    internalNotes: "Đối tác chính cho tuyến quốc tế.",
    isActive: true,
  },
  {
    id: "CR-DHL",
    code: "DHL",
    name: "DHL Express",
    type: "CARRIER",
    supportedShippingMethods: [
      "EXPRESS",
    ],
    supportedRegions: "Toàn cầu",
    contactInfo: "account@vndhl.com | 1900 5454",
    internalNotes: null,
    isActive: true,
  },
  {
    id: "CR-FEDEX",
    code: "FEDEX",
    name: "FedEx",
    type: "CARRIER",
    supportedShippingMethods: [
      "EXPRESS",
      "STANDARD",
    ],
    supportedRegions: "US, EU, AU",
    contactInfo: null,
    internalNotes: "Cần ký hợp đồng riêng cho hàng nguy hiểm.",
    isActive: false,
  },
];

