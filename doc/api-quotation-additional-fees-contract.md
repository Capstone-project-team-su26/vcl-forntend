# Contract API — Phụ phí báo giá ký gửi (gửi team backend)

Ghi chú mô tả dữ liệu mong muốn cho **phụ phí (`additionalFees`)** trong response báo giá ký gửi, để FE (web + mobile) tính và hiển thị đúng.

- Endpoint liên quan: `POST /api/orders/{orderId}/quotation/estimate` và các API trả về `quotation` của đơn ký gửi.
- File FE xử lý: `src/utils/consignmentQuotationService.js`, `src/app/pages/sales/consignments/components/ConsignmentQuotationPanel.jsx`.

## Bối cảnh sự cố (2026-07-09)

1. **Phụ phí thành tiền = 0đ** dù có đơn giá và số lượng.
   - Response trả `additionalFees[].amount = 0` cho phí chưa bật, nhưng vẫn có `unitPrice` và `quantity`.
   - FE cũ dùng thẳng `amount` từ API → hiển thị 0đ khi Sales bật phí.
2. **Console warning**: `value` prop on `input` should not be null.
   - Do `additionalFees[].quantity = null` (hoặc thiếu) đẩy vào `<input value={null}>`.

FE đã tự phòng thủ (tính lại `amount = unitPrice × quantity`, chuẩn hóa `quantity` mặc định = 1). Phần dưới là **contract đề xuất** để BE trả dữ liệu sạch, giảm rủi ro cho mọi client.

## Contract đề xuất cho mỗi phần tử `additionalFees[]`

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `feeId` hoặc `id` | string | ✅ | Khớp với `id` của pricing-rule (xem mục "Khóa map"). |
| `code` | string | ✅ | Mã phí, ví dụ `WOOD_CRATE`, `INSPECTION`. |
| `label` / `name` | string | ✅ | Tên hiển thị. |
| `feeCalculationType` | `"FIXED"` \| `"PERCENTAGE"` | ✅ | Quyết định cách tính. |
| `unitPrice` | number | ✅ | FIXED = giá/đơn vị; PERCENTAGE = phần trăm (vd `2.5`). |
| `quantity` | number \| null | ✅ | FIXED = số lượng (mặc định theo số kiện hoặc 1), **không để `null`**; PERCENTAGE = `null`. |
| `amount` | number | ✅ | Xem quy ước bên dưới. |
| `enabled` | boolean | ✅ | Phí có được áp dụng vào tổng hay không. |
| `isRequired` | boolean | ✅ | Phí bắt buộc (FE khóa, không cho tắt). |
| `unitNoun` | string | ⛔ tùy chọn | Danh từ đơn vị (`kiện`, `lần`, `ngày`)… FE tự suy nếu thiếu. |

### Quy ước `amount`

- **FIXED**: `amount = unitPrice × quantity`.
- **PERCENTAGE**: `amount = base × unitPrice / 100`, với `base` = giá trị khai báo nếu > 0, ngược lại là dịch vụ chính. Áp `minAmount`/`maxAmount` nếu có.
- **Phí chưa bật (`enabled = false`)**: `amount = 0` (chấp nhận), nhưng vẫn phải trả đúng `unitPrice` và `quantity` để client tính lại khi user bật.

### Khóa map (id vs code)

- FE map dòng phí trong báo giá với catalog `/api/pricing-rules` để tính lại khi Sales chỉnh.
- Đề nghị **thống nhất dùng `id` của pricing-rule** làm khóa chính (`feeId`), kèm `code` để fallback. Tránh trường hợp báo giá dùng `code` còn catalog dùng `id` gây lệch.

## Ví dụ response mong muốn

```json
{
  "additionalFees": [
    {
      "feeId": "rule-wood-crate",
      "code": "WOOD_CRATE",
      "label": "Đóng thùng gỗ",
      "feeCalculationType": "FIXED",
      "unitPrice": 35000,
      "quantity": 1,
      "amount": 35000,
      "enabled": true,
      "isRequired": false
    },
    {
      "feeId": "rule-insurance",
      "code": "INSURANCE",
      "label": "Phụ phí bảo hiểm",
      "feeCalculationType": "PERCENTAGE",
      "unitPrice": 3,
      "quantity": null,
      "amount": 0,
      "enabled": false,
      "isRequired": false
    }
  ]
}
```

## Sự cố (2026-07-09, bổ sung): dịch vụ chính bị tính trùng

Response `POST /quotation/estimate` trả **dịch vụ chính lẫn trong `additionalFees`**:

```json
"estimatedFreightCharge": 72000.0,
"additionalFees": [
  { "code": "MAIN_SERVICE", "feeType": "MAIN_SERVICE",
    "label": "Cước vận chuyển quốc tế", "amount": 72000.0, "isRequired": true }
]
```

FE hiển thị dịch vụ chính từ `estimatedFreightCharge` (dòng "Dịch vụ chính") **và** lại render dòng `MAIN_SERVICE` trong `additionalFees` → **cộng gấp đôi** (vd 56.000đ thay vì 28.000đ).

- **FE đã phòng thủ**: loại mọi phần tử `additionalFees` có `code === "MAIN_SERVICE"` hoặc `feeType === "MAIN_SERVICE"`.
- **Đề nghị BE**: `additionalFees` **chỉ chứa phụ phí**, KHÔNG bỏ dịch vụ chính vào đây. Cước chính đã có ở `estimatedFreightCharge`/`mainServiceAmount`.

## Tóm tắt yêu cầu BE

1. Luôn trả `quantity` (không `null`) cho phí FIXED; PERCENTAGE để `null` là hợp lệ.
2. `amount` đúng công thức, hoặc quy ước rõ "phí tắt = 0".
3. Thống nhất khóa map `feeId = id` của pricing-rule.
4. **Không** đưa `MAIN_SERVICE` (dịch vụ chính) vào `additionalFees` — tránh tính trùng cước.
