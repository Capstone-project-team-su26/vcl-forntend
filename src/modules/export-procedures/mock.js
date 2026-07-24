const HOUR_MS = 60 * 60 * 1000;

function at(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * HOUR_MS).toISOString();
}

function document(code, label, group, requirement, status, extra = {}) {
  return { id: code, code, label, group, requirement, status, ...extra };
}

export function listExportProceduresMock() {
  return Promise.resolve([
    {
      id: "demo-export-001",
      jobCode: "EXP-DEMO-001",
      masterCode: "MST-SEA-260724-01",
      bookingNumber: "MAEU-DEMO-9182",
      loadType: "FCL",
      carrier: "Maersk",
      vesselVoyage: "SANTA DEMO / 628W",
      originPort: "Cát Lái, VN",
      destinationPort: "Los Angeles, US",
      customerName: "Công ty Nội thất An Phú",
      etd: at(72),
      isDemo: true,
      customs: {
        declarationNumber: "304-DEMO-018273",
        status: "CLEARED",
        channel: "GREEN",
      },
      cutoffs: [
        { id: "si", label: "SI cut-off", dueAt: at(-12), completed: true },
        { id: "vgm", label: "VGM cut-off", dueAt: at(18), completed: true },
        { id: "cy", label: "CY cut-off", dueAt: at(30), completed: false },
      ],
      documents: [
        document("COMMERCIAL_INVOICE", "Hóa đơn thương mại", "COMMERCIAL", "LEGAL_REQUIRED", "APPROVED", {
          blocking: true,
          reference: "INV-DEMO-0724",
          owner: "Chứng từ",
        }),
        document("PACKING_LIST", "Phiếu đóng gói (Packing List)", "COMMERCIAL", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "PKL-DEMO-0724",
          owner: "Kho",
        }),
        document("CUSTOMS_DECLARATION", "Tờ khai hải quan xuất khẩu", "CUSTOMS", "LEGAL_REQUIRED", "APPROVED", {
          blocking: true,
          reference: "304-DEMO-018273",
          owner: "Khai báo HQ",
        }),
        document("EXPORT_LICENSE", "Giấy phép xuất khẩu", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("SPECIALIZED_INSPECTION", "Kết quả kiểm tra chuyên ngành", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("BOOKING_CONFIRMATION", "Xác nhận booking", "CARRIER_PORT", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "MAEU-DEMO-9182",
          owner: "Điều vận",
        }),
        document("SHIPPING_INSTRUCTION", "Shipping Instruction (SI)", "CARRIER_PORT", "OPERATIONAL", "SUBMITTED", {
          blocking: true,
          dueAt: at(-12),
          owner: "Chứng từ",
        }),
        document("VGM", "Xác nhận khối lượng toàn bộ container (VGM)", "CARRIER_PORT", "OPERATIONAL", "SUBMITTED", {
          blocking: true,
          dueAt: at(18),
          reference: "24,860 kg · Phương pháp 1",
          owner: "Điều vận",
        }),
        document("CONTAINER_SEAL", "Container & số seal", "CARRIER_PORT", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "MSDU-DEMO-101 / VCL260724",
          owner: "Kho",
        }),
        document("DRAFT_BL", "Kiểm tra Draft B/L", "POST_DEPARTURE", "OPERATIONAL", "IN_PROGRESS", {
          dueAt: at(45),
          owner: "Chứng từ",
        }),
        document("FINAL_BL", "Bản chính/telex release B/L", "POST_DEPARTURE", "OPERATIONAL", "NOT_STARTED", {
          dueAt: at(110),
          owner: "Chứng từ",
        }),
        document("CERTIFICATE_OF_ORIGIN", "Giấy chứng nhận xuất xứ (C/O)", "POST_DEPARTURE", "CONDITIONAL", "IN_PROGRESS", {
          dueAt: at(96),
          owner: "Chứng từ",
          note: "Theo yêu cầu hưởng ưu đãi thuế của người mua.",
        }),
      ],
    },
    {
      id: "demo-export-002",
      jobCode: "EXP-DEMO-002",
      masterCode: "MST-LCL-260724-02",
      bookingNumber: "ONE-DEMO-4407",
      loadType: "LCL",
      carrier: "ONE / Co-loader",
      vesselVoyage: "OCEAN DEMO / 032S",
      originPort: "Hải Phòng, VN",
      destinationPort: "Yokohama, JP",
      customerName: "Công ty May mặc Đông Á",
      etd: at(58),
      isDemo: true,
      customs: {
        declarationNumber: "305-DEMO-887201",
        status: "INSPECTION",
        channel: "YELLOW",
      },
      cutoffs: [
        { id: "doc", label: "Document cut-off", dueAt: at(10), completed: true },
        { id: "cfs", label: "CFS cargo cut-off", dueAt: at(22), completed: false },
      ],
      documents: [
        document("COMMERCIAL_INVOICE", "Hóa đơn thương mại", "COMMERCIAL", "LEGAL_REQUIRED", "APPROVED", {
          blocking: true,
          reference: "INV-DEMO-188",
          owner: "Chứng từ",
        }),
        document("PACKING_LIST", "Phiếu đóng gói (Packing List)", "COMMERCIAL", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "PKL-DEMO-188",
          owner: "Kho",
        }),
        document("CUSTOMS_DECLARATION", "Tờ khai hải quan xuất khẩu", "CUSTOMS", "LEGAL_REQUIRED", "SUBMITTED", {
          blocking: true,
          dueAt: at(16),
          reference: "305-DEMO-887201",
          owner: "Khai báo HQ",
        }),
        document("EXPORT_LICENSE", "Giấy phép xuất khẩu", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("SPECIALIZED_INSPECTION", "Kết quả kiểm tra chuyên ngành", "CUSTOMS", "CONDITIONAL", "IN_PROGRESS", {
          blocking: true,
          dueAt: at(14),
          owner: "Khai báo HQ",
          note: "Lô đang chờ kết quả kiểm tra chất lượng.",
        }),
        document("BOOKING_CONFIRMATION", "Xác nhận booking/co-loader", "CARRIER_PORT", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "ONE-DEMO-4407",
          owner: "Điều vận",
        }),
        document("SHIPPING_INSTRUCTION", "Shipping Instruction (SI)", "CARRIER_PORT", "OPERATIONAL", "SUBMITTED", {
          blocking: true,
          dueAt: at(10),
          owner: "Chứng từ",
        }),
        document("VGM", "VGM cấp lô", "CARRIER_PORT", "OPERATIONAL", "NOT_APPLICABLE", {
          note: "LCL không khai VGM ở cấp lô hàng lẻ; co-loader chịu trách nhiệm container gom.",
        }),
        document("CFS_RECEIPT", "Phiếu nhận hàng CFS", "CARRIER_PORT", "OPERATIONAL", "IN_PROGRESS", {
          blocking: true,
          dueAt: at(22),
          owner: "Điều vận",
        }),
        document("DRAFT_HBL", "Kiểm tra Draft HBL", "POST_DEPARTURE", "OPERATIONAL", "NOT_STARTED", {
          dueAt: at(38),
          owner: "Chứng từ",
        }),
        document("FINAL_HBL", "Bản chính/telex release HBL", "POST_DEPARTURE", "OPERATIONAL", "NOT_STARTED", {
          dueAt: at(96),
          owner: "Chứng từ",
        }),
        document("CERTIFICATE_OF_ORIGIN", "Giấy chứng nhận xuất xứ (C/O)", "POST_DEPARTURE", "CONDITIONAL", "IN_PROGRESS", {
          dueAt: at(72),
          owner: "Chứng từ",
        }),
      ],
    },
    {
      id: "demo-export-003",
      jobCode: "EXP-DEMO-003",
      masterCode: "MST-SEA-260724-03",
      bookingNumber: "CMA-DEMO-7715",
      loadType: "FCL",
      carrier: "CMA CGM",
      vesselVoyage: "APL DEMO / 214E",
      originPort: "Cái Mép, VN",
      destinationPort: "Hamburg, DE",
      customerName: "Công ty Gỗ Minh Long",
      etd: at(28),
      isDemo: true,
      customs: {
        declarationNumber: "304-DEMO-990122",
        status: "INSPECTION",
        channel: "RED",
      },
      cutoffs: [
        { id: "si", label: "SI cut-off", dueAt: at(-18), completed: true },
        { id: "vgm", label: "VGM cut-off", dueAt: at(-4), completed: false },
        { id: "cy", label: "CY cut-off", dueAt: at(6), completed: false },
      ],
      documents: [
        document("COMMERCIAL_INVOICE", "Hóa đơn thương mại", "COMMERCIAL", "LEGAL_REQUIRED", "APPROVED", {
          blocking: true,
          reference: "INV-DEMO-903",
          owner: "Chứng từ",
        }),
        document("PACKING_LIST", "Phiếu đóng gói (Packing List)", "COMMERCIAL", "OPERATIONAL", "APPROVED", {
          blocking: true,
          owner: "Kho",
        }),
        document("CUSTOMS_DECLARATION", "Tờ khai hải quan xuất khẩu", "CUSTOMS", "LEGAL_REQUIRED", "SUBMITTED", {
          blocking: true,
          reference: "304-DEMO-990122",
          owner: "Khai báo HQ",
        }),
        document("EXPORT_LICENSE", "Giấy phép xuất khẩu", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("TIMBER_STATEMENT", "Bảng kê lâm sản", "CUSTOMS", "CONDITIONAL", "ISSUE", {
          blocking: true,
          dueAt: at(-6),
          owner: "Khai báo HQ",
          note: "Thiếu xác nhận nguồn gốc của một nhóm sản phẩm.",
        }),
        document("SPECIALIZED_INSPECTION", "Kết quả kiểm tra chuyên ngành", "CUSTOMS", "CONDITIONAL", "IN_PROGRESS", {
          blocking: true,
          dueAt: at(3),
          owner: "Khai báo HQ",
        }),
        document("BOOKING_CONFIRMATION", "Xác nhận booking", "CARRIER_PORT", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "CMA-DEMO-7715",
          owner: "Điều vận",
        }),
        document("SHIPPING_INSTRUCTION", "Shipping Instruction (SI)", "CARRIER_PORT", "OPERATIONAL", "SUBMITTED", {
          blocking: true,
          dueAt: at(-18),
          owner: "Chứng từ",
        }),
        document("VGM", "Xác nhận khối lượng toàn bộ container (VGM)", "CARRIER_PORT", "OPERATIONAL", "NOT_STARTED", {
          blocking: true,
          dueAt: at(-4),
          owner: "Điều vận",
          note: "Đã quá VGM cut-off; cần làm việc ngay với hãng tàu.",
        }),
        document("CONTAINER_SEAL", "Container & số seal", "CARRIER_PORT", "OPERATIONAL", "APPROVED", {
          blocking: true,
          reference: "CMAU-DEMO-388 / VCL260725",
          owner: "Kho",
        }),
        document("DRAFT_BL", "Kiểm tra Draft B/L", "POST_DEPARTURE", "OPERATIONAL", "NOT_STARTED", {
          dueAt: at(18),
          owner: "Chứng từ",
        }),
        document("FINAL_BL", "Bản chính/telex release B/L", "POST_DEPARTURE", "OPERATIONAL", "NOT_STARTED", {
          dueAt: at(72),
          owner: "Chứng từ",
        }),
        document("CERTIFICATE_OF_ORIGIN", "Giấy chứng nhận xuất xứ (C/O)", "POST_DEPARTURE", "CONDITIONAL", "NOT_APPLICABLE"),
      ],
    },
    {
      id: "demo-export-004",
      jobCode: "EXP-DEMO-004",
      masterCode: "MST-SEA-260720-04",
      bookingNumber: "HLC-DEMO-3201",
      loadType: "FCL",
      carrier: "Hapag-Lloyd",
      vesselVoyage: "BERLIN DEMO / 067W",
      originPort: "Cát Lái, VN",
      destinationPort: "Singapore, SG",
      customerName: "Công ty Nhựa Việt Thành",
      etd: at(-72),
      isDemo: true,
      customs: {
        declarationNumber: "304-DEMO-661020",
        status: "CLEARED",
        channel: "GREEN",
      },
      cutoffs: [
        { id: "si", label: "SI cut-off", dueAt: at(-110), completed: true },
        { id: "vgm", label: "VGM cut-off", dueAt: at(-100), completed: true },
        { id: "cy", label: "CY cut-off", dueAt: at(-90), completed: true },
      ],
      documents: [
        document("COMMERCIAL_INVOICE", "Hóa đơn thương mại", "COMMERCIAL", "LEGAL_REQUIRED", "APPROVED", { blocking: true }),
        document("PACKING_LIST", "Phiếu đóng gói (Packing List)", "COMMERCIAL", "OPERATIONAL", "APPROVED", { blocking: true }),
        document("CUSTOMS_DECLARATION", "Tờ khai hải quan xuất khẩu", "CUSTOMS", "LEGAL_REQUIRED", "APPROVED", { blocking: true }),
        document("EXPORT_LICENSE", "Giấy phép xuất khẩu", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("SPECIALIZED_INSPECTION", "Kết quả kiểm tra chuyên ngành", "CUSTOMS", "CONDITIONAL", "NOT_APPLICABLE"),
        document("BOOKING_CONFIRMATION", "Xác nhận booking", "CARRIER_PORT", "OPERATIONAL", "APPROVED", { blocking: true }),
        document("SHIPPING_INSTRUCTION", "Shipping Instruction (SI)", "CARRIER_PORT", "OPERATIONAL", "APPROVED", { blocking: true }),
        document("VGM", "Xác nhận khối lượng toàn bộ container (VGM)", "CARRIER_PORT", "OPERATIONAL", "APPROVED", { blocking: true }),
        document("CONTAINER_SEAL", "Container & số seal", "CARRIER_PORT", "OPERATIONAL", "APPROVED", { blocking: true }),
        document("DRAFT_BL", "Kiểm tra Draft B/L", "POST_DEPARTURE", "OPERATIONAL", "APPROVED"),
        document("FINAL_BL", "Bản chính/telex release B/L", "POST_DEPARTURE", "OPERATIONAL", "APPROVED"),
        document("CERTIFICATE_OF_ORIGIN", "Giấy chứng nhận xuất xứ (C/O)", "POST_DEPARTURE", "CONDITIONAL", "NOT_APPLICABLE"),
      ],
    },
  ]);
}
