export const restrictedItems = [
  {
    id: "RI-001",
    name: "Pin lithium loại lớn",
    country: "VN",
    restrictionType: "PROHIBITED",
    notes: "Không vận chuyển theo quy định hàng nguy hiểm.",
    isActive: true,
  },
  {
    id: "RI-002",
    name: "Thực phẩm tươi sống",
    country: null,
    restrictionType: "RESTRICTED",
    notes: "Cần giấy phép nhập khẩu và kiểm dịch tại quốc gia đích.",
    isActive: true,
  },
  {
    id: "RI-003",
    name: "Mỹ phẩm chứa retinol",
    country: "US",
    restrictionType: "CONDITIONAL",
    notes: "Chỉ chấp nhận nếu có nhãn FDA và hóa đơn mua hàng.",
    isActive: true,
  },
  {
    id: "RI-004",
    name: "Vũ khí và linh kiện",
    country: null,
    restrictionType: "PROHIBITED",
    notes: "Cấm tuyệt đối theo luật vận tải quốc tế.",
    isActive: false,
  },
  {
    id: "RI-005",
    name: "Thuốc kê đơn",
    country: "JP",
    restrictionType: "RESTRICTED",
    notes: "Yêu cầu đơn thuốc và giấy phép nhập khẩu.",
    isActive: true,
  },
];

