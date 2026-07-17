export const shippingMethods = [
  {
    id: "SM-EXPRESS",
    code: "EXPRESS",
    name: "Express Air",
    description: "Vận chuyển hàng không ưu tiên, theo dõi realtime.",
    estimatedDeliveryTime: "2–3 ngày làm việc",
    applicableConditions: "Hàng dưới 30kg, không thuộc danh mục cấm.",
    internalNotes: "Ưu tiên tuyến quốc tế US/EU.",
    isActive: true,
    additionalServices: [
      {
        id: "AS-INS",
        name: "Bảo hiểm hàng hóa",
        description: "Bảo vệ hàng đến giá trị khai báo",
      },
      {
        id: "AS-FRAG",
        name: "Xử lý hàng dễ vỡ",
        description: "Đóng gói và vận chuyển đặc biệt",
      },
    ],
  },
  {
    id: "SM-STANDARD",
    code: "STANDARD",
    name: "Standard Air",
    description: "Cân bằng chi phí và thời gian giao hàng.",
    estimatedDeliveryTime: "5–7 ngày làm việc",
    applicableConditions: "Phù hợp hàng thông thường, không yêu cầu giao gấp.",
    internalNotes: null,
    isActive: true,
    additionalServices: [
      {
        id: "AS-INS",
        name: "Bảo hiểm hàng hóa",
        description: "Bảo vệ hàng đến giá trị khai báo",
      },
    ],
  },
  {
    id: "SM-ECONOMY",
    code: "ECONOMY",
    name: "Economy Ground",
    description: "Phương thức tiết kiệm cho hàng không gấp.",
    estimatedDeliveryTime: "7–10 ngày làm việc",
    applicableConditions: "Hàng không dễ hỏng, giá trị khai báo dưới 500.000 VND.",
    internalNotes: "Không áp dụng cho hàng dễ vỡ.",
    isActive: true,
    additionalServices: [],
  },
  {
    id: "SM-FREIGHT",
    code: "FREIGHT",
    name: "Freight",
    description: "Vận chuyển hàng cồng kềnh, pallet hoặc container lẻ.",
    estimatedDeliveryTime: "10–14 ngày làm việc",
    applicableConditions: "Trọng lượng từ 30kg trở lên hoặc thể tích lớn.",
    internalNotes: "Cần báo giá riêng nếu vượt 500kg.",
    isActive: false,
    additionalServices: [],
  },
];

