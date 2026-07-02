# Seeding phụ phí (Pricing Rules)

Tài liệu seed dữ liệu **phí dịch vụ bổ sung** cho môi trường VCL. FE Admin map form → `POST /api/pricing-rules` (xem `additionalServiceFeeService.js`, `toApiPricingRuleFromAdditionalFeePayload`).

**API:** `https://api-vcl.purintech.id.vn/api/pricing-rules`  
**Cập nhật:** 01/07/2026

---

## Quy ước BE

| Field FE / form | Field API | Ghi chú |
|-----------------|-----------|---------|
| Tên loại phí | `ruleName` | |
| Mã loại phí | `ruleCode` | Nên prefix `SUR_` |
| — | `ruleType` | `INSPECTION`, `INSURANCE`, `WOOD_BOX`, … |
| Đơn vị tính | `conditionType` | VD: `PER_PACKAGE`, `MIN_DECLARED_VALUE` |
| — | `conditionValue` | VD: ngưỡng khai báo `5000000` |
| Giá cố định / % | `calculationType` + `value` | `FIXED` hoặc `PERCENTAGE` |
| Đang hoạt động | `status` | `ACTIVE` / `INACTIVE` |
| — | `servicePricingId` | `null` = áp dụng toàn hệ thống |

---

## Đã có trên BE (không seed lại)

Lấy từ `GET /api/pricing-rules` ngày 01/07/2026.

### 1. Phụ phí kiểm hàng

| Thuộc tính | Giá trị |
|------------|---------|
| `id` | `397a6b9a-4efd-4de7-9367-de60b5a65616` |
| `ruleCode` | `SUR_INSPECTION` |
| `ruleType` | `INSPECTION` |
| `conditionType` | `REQUIRES_INSPECTION` |
| `calculationType` | `FIXED` |
| `value` | **50.000** VND |
| `status` | `ACTIVE` |

**Admin form (tham khảo):**

- Tên: `Phụ phí kiểm hàng`
- Mã: `INSPECTION` (FE map → `SUR_INSPECTION` khi gửi API tùy cấu hình)
- Cách tính: Giá cố định → `50000`
- Đơn vị: `REQUIRES_INSPECTION`
- Mô tả: `Kiểm đếm, chụp ảnh và xác nhận tình trạng hàng trước khi đóng gói.`

**Gợi ý chỉnh:** đặt `isRequired: true` nếu muốn khóa tick khi đơn có `requiresInspection: true`.

```json
{
  "servicePricingId": null,
  "ruleName": "Phụ phí kiểm hàng",
  "ruleCode": "SUR_INSPECTION",
  "ruleType": "INSPECTION",
  "conditionType": "REQUIRES_INSPECTION",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 50000,
  "isRequired": true,
  "status": "ACTIVE",
  "description": "Kiểm đếm, chụp ảnh và xác nhận tình trạng hàng trước khi đóng gói."
}
```

---

### 2. Phụ phí bảo hiểm

| Thuộc tính | Giá trị |
|------------|---------|
| `id` | `ecf99dbf-a298-4368-bb9f-f3e01cc97195` |
| `ruleCode` | `SUR_INSURANCE_3PERCENT` |
| `ruleType` | `INSURANCE` |
| `conditionType` | `MIN_DECLARED_VALUE` |
| `conditionValue` | `5000000` |
| `calculationType` | `PERCENTAGE` |
| `value` | **3** % |
| `minAmount` | 10.000 VND |
| `maxAmount` | 1.000.000 VND |
| `status` | `ACTIVE` |

**Admin form:**

- Tên: `Phụ phí bảo hiểm`
- Mã: `INSURANCE`
- Cách tính: Theo phần trăm → `3`
- Đơn vị: `MIN_DECLARED_VALUE` (hoặc ghi chú `% giá trị khai báo từ 5tr`)
- Mô tả: `Bảo hiểm 3% giá trị khai báo từ 5.000.000 ₫ trở lên.`

```json
{
  "servicePricingId": null,
  "ruleName": "Phụ phí bảo hiểm",
  "ruleCode": "SUR_INSURANCE_3PERCENT",
  "ruleType": "INSURANCE",
  "conditionType": "MIN_DECLARED_VALUE",
  "conditionValue": "5000000",
  "calculationType": "PERCENTAGE",
  "value": 3,
  "minAmount": 10000,
  "maxAmount": 1000000,
  "isRequired": false,
  "status": "ACTIVE",
  "description": "Bảo hiểm 3% giá trị declared value từ 5tr trở lên"
}
```

---

## Cần seed thêm (catalog FE / nghiệp vụ)

Các loại dưới **chưa có** trên BE (tính đến 01/07/2026). Giá tham chiếu catalog mock VND + convention `SUR_*`.

### 3. Đóng thùng gỗ

**Admin:**

| Field | Giá trị |
|-------|---------|
| Tên | `Đóng thùng gỗ` |
| Mã | `WOOD_CRATE` |
| Cách tính | Giá cố định → **35.000** |
| Đơn vị | `VND/kiện` hoặc `PER_PACKAGE` |
| Hoạt động | ✓ |

```json
{
  "servicePricingId": null,
  "ruleName": "Đóng thùng gỗ",
  "ruleCode": "SUR_WOOD_CRATE",
  "ruleType": "WOOD_BOX",
  "conditionType": "PER_PACKAGE",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 35000,
  "isRequired": false,
  "status": "ACTIVE",
  "description": "Đóng gói thùng gỗ chuyên dụng cho hàng cồng kềnh hoặc dễ vỡ."
}
```

---

### 4. Gia cố kiện hàng

| Field | Giá trị |
|-------|---------|
| Tên | `Gia cố kiện hàng` |
| Mã | `REINFORCE` |
| Cách tính | Giá cố định → **12.000** |
| Đơn vị | `VND/kiện` |

```json
{
  "servicePricingId": null,
  "ruleName": "Gia cố kiện hàng",
  "ruleCode": "SUR_REINFORCE",
  "ruleType": "REINFORCE",
  "conditionType": "PER_PACKAGE",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 12000,
  "isRequired": false,
  "status": "ACTIVE",
  "description": "Bọt xốp, chống sốc và gia cố cạnh kiện hàng."
}
```

---

### 5. Đóng gói lại (repack)

| Field | Giá trị |
|-------|---------|
| Tên | `Đóng gói lại` |
| Mã | `REPACK` |
| Cách tính | Giá cố định → **25.000** |
| Đơn vị | `VND/kiện` |

```json
{
  "servicePricingId": null,
  "ruleName": "Đóng gói lại",
  "ruleCode": "SUR_REPACK",
  "ruleType": "REPACK",
  "conditionType": "PER_PACKAGE",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 25000,
  "isRequired": false,
  "status": "ACTIVE",
  "description": "Tháo gói, đóng lại kiện hàng theo chuẩn vận chuyển quốc tế."
}
```

---

### 6. Phí nhập kho

| Field | Giá trị |
|-------|---------|
| Tên | `Phí nhập kho` |
| Mã | `INBOUND` |
| Cách tính | Giá cố định → **20.000** |
| Đơn vị | `VND/kiện` |

```json
{
  "servicePricingId": null,
  "ruleName": "Phí nhập kho",
  "ruleCode": "SUR_INBOUND",
  "ruleType": "INBOUND",
  "conditionType": "PER_PACKAGE",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 20000,
  "isRequired": false,
  "status": "ACTIVE",
  "description": "Xử lý, cân đo và ghi nhận kiện khi hàng về kho nước ngoài."
}
```

---

### 7. Lưu kho (tùy chọn — seed INACTIVE)

| Field | Giá trị |
|-------|---------|
| Tên | `Lưu kho` |
| Mã | `STORAGE` |
| Cách tính | Giá cố định → **8.000** |
| Đơn vị | `VND/kiện/ngày` |
| Hoạt động | ✗ (bật sau khi BE hỗ trợ tính theo số ngày) |

```json
{
  "servicePricingId": null,
  "ruleName": "Lưu kho",
  "ruleCode": "SUR_STORAGE",
  "ruleType": "STORAGE",
  "conditionType": "PER_PACKAGE_PER_DAY",
  "conditionValue": null,
  "calculationType": "FIXED",
  "value": 8000,
  "isRequired": false,
  "status": "INACTIVE",
  "description": "Lưu kho chờ ghép hoặc chờ vận chuyển."
}
```

---

## Cách seed

### A. Qua Admin FE

`/pages/admin/additional-service-fees` → **Thêm loại phí** → điền theo bảng trên.

### B. Qua API (`curl`)

Thay `Authorization` nếu endpoint yêu cầu đăng nhập.

```powershell
$base = "https://api-vcl.purintech.id.vn/api/pricing-rules"
# $headers = @{ Authorization = "Bearer <token>" }

# Đóng thùng gỗ
curl.exe -s -X POST $base -H "Content-Type: application/json" -d "{\"ruleName\":\"Đóng thùng gỗ\",\"ruleCode\":\"SUR_WOOD_CRATE\",\"ruleType\":\"WOOD_BOX\",\"conditionType\":\"PER_PACKAGE\",\"calculationType\":\"FIXED\",\"value\":35000,\"isRequired\":false,\"status\":\"ACTIVE\",\"description\":\"Đóng gói thùng gỗ chuyên dụng.\"}"

# Gia cố
curl.exe -s -X POST $base -H "Content-Type: application/json" -d "{\"ruleName\":\"Gia cố kiện hàng\",\"ruleCode\":\"SUR_REINFORCE\",\"ruleType\":\"REINFORCE\",\"conditionType\":\"PER_PACKAGE\",\"calculationType\":\"FIXED\",\"value\":12000,\"isRequired\":false,\"status\":\"ACTIVE\",\"description\":\"Bọt xốp, chống sốc và gia cố cạnh kiện.\"}"

# Repack
curl.exe -s -X POST $base -H "Content-Type: application/json" -d "{\"ruleName\":\"Đóng gói lại\",\"ruleCode\":\"SUR_REPACK\",\"ruleType\":\"REPACK\",\"conditionType\":\"PER_PACKAGE\",\"calculationType\":\"FIXED\",\"value\":25000,\"isRequired\":false,\"status\":\"ACTIVE\",\"description\":\"Tháo gói, đóng lại kiện hàng.\"}"

# Nhập kho
curl.exe -s -X POST $base -H "Content-Type: application/json" -d "{\"ruleName\":\"Phí nhập kho\",\"ruleCode\":\"SUR_INBOUND\",\"ruleType\":\"INBOUND\",\"conditionType\":\"PER_PACKAGE\",\"calculationType\":\"FIXED\",\"value\":20000,\"isRequired\":false,\"status\":\"ACTIVE\",\"description\":\"Xử lý kiện khi hàng về kho.\"}"

# Lưu kho (INACTIVE)
curl.exe -s -X POST $base -H "Content-Type: application/json" -d "{\"ruleName\":\"Lưu kho\",\"ruleCode\":\"SUR_STORAGE\",\"ruleType\":\"STORAGE\",\"conditionType\":\"PER_PACKAGE_PER_DAY\",\"calculationType\":\"FIXED\",\"value\":8000,\"isRequired\":false,\"status\":\"INACTIVE\",\"description\":\"Lưu kho chờ ghép hoặc chờ vận chuyển.\"}"
```

### C. Cập nhật rule kiểm hàng (đã có)

```powershell
curl.exe -s -X PUT "$base/397a6b9a-4efd-4de7-9367-de60b5a65616" -H "Content-Type: application/json" -d "{\"ruleName\":\"Phụ phí kiểm hàng\",\"ruleCode\":\"SUR_INSPECTION\",\"ruleType\":\"INSPECTION\",\"conditionType\":\"REQUIRES_INSPECTION\",\"calculationType\":\"FIXED\",\"value\":50000,\"isRequired\":true,\"status\":\"ACTIVE\",\"description\":\"Kiểm đếm, chụp ảnh trước khi đóng gói.\"}"
```

---

## Kiểm tra sau seed

**Đơn mẫu:** TQ–VN Express, 2 kg, 8 m³, `requiresInspection: true`, `declaredValue: 2` (dưới 5 triệu).

| Khoản | Tự bật? | Thành tiền |
|-------|---------|------------|
| Kiểm hàng | ✓ (nếu `isRequired` / `requiresInspection`) | 50.000 ₫ |
| Bảo hiểm 3% | ✗ (`declaredValue` < 5.000.000) | 0 ₫ |
| Đóng thùng gỗ | ✗ (tick thủ công) | 35.000 × số kiện |
| **Tổng phụ phí tối thiểu** | | **≈ 50.000 ₫** (khớp `serviceFee: 50000` từ BE estimate) |

**Xác nhận:**

1. `GET /api/pricing-rules` — đủ rule `ACTIVE`.
2. Màn Sales báo giá — bảng **Phụ phí bổ sung** hiện danh sách từ catalog.
3. Admin → Phí dịch vụ bổ sung — danh sách đồng bộ.

---

## Liên quan code FE

| File | Vai trò |
|------|---------|
| `src/utils/additionalServiceFeeService.js` | CRUD → `/api/pricing-rules` |
| `src/utils/apiMappers.js` | `toApiPricingRuleFromAdditionalFeePayload` |
| `src/utils/consignmentQuotationService.js` | Tính dòng phụ phí khi báo giá |
| `src/app/pages/admin/additional-service-fees/` | UI cấu hình Admin |

Mock seed (chỉ khi `NEXT_PUBLIC_DATA_SOURCE=mock`): `src/utils/mocks/mockStore.js` → `additionalServiceFees`.
