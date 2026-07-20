# API drift — FE vs BE swagger (2026-07-20)

Nguồn: `https://api-vcl.zushin.io.vn/swagger/v1/swagger.json`

## Đã gỡ trên FE (không còn gọi endpoint chết)

| Endpoint FE cũ | Thay bằng |
|---|---|
| `POST /api/orders/{id}/quotation/estimate` | Tính local + `GET /api/orders/{id}/quotation` (nếu đã có báo giá) |
| `GET /api/purchase-orders/{id}` | `GET /api/purchase-requests/{requestId}` (PO nhúng trong request); route status dùng **requestId** |
| `/api/Operations/*` (dashboard, transfer, estimate-price) | Mock / báo lỗi rõ — BE đã bỏ tag Operations |

## Vẫn ổn / còn trên swagger

- Báo giá: `POST .../quotation/send`, `POST .../quotation/reject`, `GET .../quotation`, `PUT /api/quotations/{id}/accept`
- `POST /api/staff/consignments`, `/api/orders/consignments/*`
- `/api/service-pricings`, `/api/pricing-rules`, `/api/additional-service-fees` (hai catalog phí — FE phụ phí đang dùng **pricing-rules**)
- `/api/Staff/sales` — FE **không gọi**; dashboard Sales aggregate từ consignments

## Contract payload cần khớp

`AdditionalFeeDto` swagger (`additionalProperties: false`) chỉ nhận:

`feeId`, `code`, `label`, `amount`, `enabled`

Không gửi `unitPrice` / `quantity` / `isRequired` lên BE (FE vẫn tính local để hiển thị).

## Ghi chú

- `/api/auth/logout` là route **Next.js nội bộ** (cookie session), không phải BE.
- Script quét tạm: `doc/_chua-dat-ten/_scan-api-drift.mjs` (có thể xóa sau).
